import React from 'react'
import { render } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { UserProfileSetup } from '@/components/Profile/UserProfileSetup'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User</div>,
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Camera: () => <div data-testid="camera-icon">Camera</div>,
  Mic: () => <div data-testid="mic-icon">Mic</div>,
  Volume2: () => <div data-testid="volume-icon">Volume</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Save: () => <div data-testid="save-icon">Save</div>
}))

describe('UserProfileSetup', () => {
  const mockOnComplete = jest.fn()
  
  beforeEach(() => {
    mockOnComplete.mockClear()
  })

  it('renders the first step (basic info) correctly', () => {
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5: Basic Info')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Display Name (Optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Bio (Optional)')).toBeInTheDocument()
  })

  it('validates username input correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    const nextButton = screen.getByText('Next')
    const usernameInput = screen.getByLabelText('Username')
    
    // Next button should be disabled initially
    expect(nextButton).toBeDisabled()
    
    // Enter a short username (less than 3 characters)
    await user.type(usernameInput, 'ab')
    expect(nextButton).toBeDisabled()
    
    // Enter a valid username
    await user.clear(usernameInput)
    await user.type(usernameInput, 'testuser')
    expect(nextButton).not.toBeDisabled()
  })

  it('handles bio character limit correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    const bioTextarea = screen.getByLabelText('Bio (Optional)')
    const longBio = 'a'.repeat(250) // Exceeds 200 character limit
    
    await user.type(bioTextarea, longBio)
    
    // Should only show first 200 characters
    expect(bioTextarea).toHaveValue('a'.repeat(200))
    expect(screen.getByText('200/200 characters')).toBeInTheDocument()
  })

  it('navigates through all steps correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Step 1: Basic Info
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    
    let nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Step 2: Interests
    expect(screen.getByText('Step 2 of 5: Interests')).toBeInTheDocument()
    expect(screen.getByText('Select Your Interests')).toBeInTheDocument()
    
    // Select an interest and language
    const musicButton = screen.getByText('Music')
    await user.click(musicButton)
    
    nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Step 3: Matching
    expect(screen.getByText('Step 3 of 5: Matching')).toBeInTheDocument()
    expect(screen.getByText('Age Range')).toBeInTheDocument()
    
    nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Step 4: Privacy
    expect(screen.getByText('Step 4 of 5: Privacy')).toBeInTheDocument()
    expect(screen.getByText('Privacy & Safety')).toBeInTheDocument()
    
    nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Step 5: Settings
    expect(screen.getByText('Step 5 of 5: Settings')).toBeInTheDocument()
    expect(screen.getByText('Settings Configured')).toBeInTheDocument()
    
    // Complete profile
    const completeButton = screen.getByText('Complete Profile')
    await user.click(completeButton)
    
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'testuser',
        interests: ['Music'],
        languages: ['English']
      })
    )
  })

  it('allows interest selection and deselection', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Navigate to interests step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    // Select multiple interests
    const musicButton = screen.getByText('Music')
    const gamingButton = screen.getByText('Gaming')
    
    await user.click(musicButton)
    await user.click(gamingButton)
    
    // Check if buttons are selected (should have different styling)
    expect(musicButton).toHaveClass('bg-blue-600')
    expect(gamingButton).toHaveClass('bg-blue-600')
    
    // Deselect one interest
    await user.click(musicButton)
    expect(musicButton).not.toHaveClass('bg-blue-600')
    expect(gamingButton).toHaveClass('bg-blue-600')
  })

  it('handles age range selection correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Navigate to matching preferences step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    // Select an interest to proceed
    await user.click(screen.getByText('Music'))
    await user.click(screen.getByText('Next'))
    
    // Check age range sliders
    const minAgeSlider = screen.getAllByRole('slider')[0]
    const maxAgeSlider = screen.getAllByRole('slider')[1]
    
    expect(minAgeSlider).toHaveValue('18')
    expect(maxAgeSlider).toHaveValue('35')
    
    // Change age range
    fireEvent.change(minAgeSlider, { target: { value: '25' } })
    fireEvent.change(maxAgeSlider, { target: { value: '40' } })
    
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('handles chat type selection correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Navigate to matching preferences step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    await user.click(screen.getByText('Music'))
    await user.click(screen.getByText('Next'))
    
    // Check chat type options
    const videoOnlyRadio = screen.getByDisplayValue('video')
    const textOnlyRadio = screen.getByDisplayValue('text')
    const bothRadio = screen.getByDisplayValue('both')
    
    // Both should be selected by default
    expect(bothRadio).toBeChecked()
    
    // Select video only
    await user.click(videoOnlyRadio)
    expect(videoOnlyRadio).toBeChecked()
    expect(bothRadio).not.toBeChecked()
  })

  it('handles session length selection correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Navigate to matching preferences step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    await user.click(screen.getByText('Music'))
    await user.click(screen.getByText('Next'))
    
    // Check session length options
    const fiveMinButton = screen.getByText('5 Minutes')
    const unlimitedButton = screen.getByText('No Limit')
    
    // 10 minutes should be selected by default
    expect(screen.getByText('10 Minutes')).toHaveClass('bg-purple-600')
    
    // Select 5 minutes
    await user.click(fiveMinButton)
    expect(fiveMinButton).toHaveClass('bg-purple-600')
  })

  it('allows going back to previous steps', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Navigate to step 2
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    expect(screen.getByText('Step 2 of 5: Interests')).toBeInTheDocument()
    
    // Go back to step 1
    const previousButton = screen.getByText('Previous')
    await user.click(previousButton)
    
    expect(screen.getByText('Step 1 of 5: Basic Info')).toBeInTheDocument()
    expect(usernameInput).toHaveValue('testuser') // Should preserve data
  })

  it('loads existing profile data correctly', () => {
    const existingProfile = {
      username: 'existinguser',
      displayName: 'Existing User',
      age: 25,
      interests: ['Music', 'Gaming'],
      languages: ['English', 'Spanish']
    }
    
    render(<UserProfileSetup onComplete={mockOnComplete} existingProfile={existingProfile} />)
    
    expect(screen.getByDisplayValue('existinguser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
  })

  it('prevents proceeding without required fields', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Try to proceed without username
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
    
    // Navigate to interests step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(nextButton)
    
    // Try to proceed without selecting interests or languages
    const nextButton2 = screen.getByText('Next')
    expect(nextButton2).toBeDisabled()
    
    // Select an interest
    await user.click(screen.getByText('Music'))
    expect(nextButton2).not.toBeDisabled()
  })

  it('displays progress indicators correctly', async () => {
    const user = userEvent.setup()
    render(<UserProfileSetup onComplete={mockOnComplete} />)
    
    // Check initial progress
    const progressSteps = screen.getAllByRole('generic').filter((el: HTMLElement) => 
      el.className.includes('w-10 h-10 rounded-full')
    )
    
    expect(progressSteps[0]).toHaveClass('bg-blue-600') // Current step
    expect(progressSteps[1]).toHaveClass('bg-gray-200') // Future step
    
    // Navigate to next step
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    await user.click(screen.getByText('Next'))
    
    // Check updated progress
    const updatedProgressSteps = screen.getAllByRole('generic').filter((el: HTMLElement) => 
      el.className.includes('w-10 h-10 rounded-full')
    )
    
    expect(updatedProgressSteps[0]).toHaveClass('bg-blue-600') // Completed step
    expect(updatedProgressSteps[1]).toHaveClass('bg-blue-600') // Current step
  })
}) 