import { UserProfile, MatchingAlgorithm, MatchingPreferences } from '@/types/user'

export class AdvancedMatchingService {
  private static instance: AdvancedMatchingService
  private activeUsers: Map<string, UserProfile> = new Map()
  private matchingQueue: Map<string, Date> = new Map()
  private recentMatches: Map<string, string[]> = new Map()

  public static getInstance(): AdvancedMatchingService {
    if (!AdvancedMatchingService.instance) {
      AdvancedMatchingService.instance = new AdvancedMatchingService()
    }
    return AdvancedMatchingService.instance
  }

  public addToQueue(user: UserProfile): void {
    this.activeUsers.set(user.id, user)
    this.matchingQueue.set(user.id, new Date())
  }

  public removeFromQueue(userId: string): void {
    this.activeUsers.delete(userId)
    this.matchingQueue.delete(userId)
  }

  public async findBestMatch(userId: string): Promise<UserProfile | null> {
    const user = this.activeUsers.get(userId)
    if (!user) return null

    const candidates = Array.from(this.activeUsers.values())
      .filter(candidate => 
        candidate.id !== userId && 
        this.isEligibleMatch(user, candidate)
      )

    if (candidates.length === 0) return null

    // Score and sort candidates
    const scoredCandidates = candidates
      .map(candidate => ({
        user: candidate,
        score: this.calculateCompatibilityScore(user, candidate)
      }))
      .sort((a, b) => b.score.compatibilityScore - a.score.compatibilityScore)

    // Return the best match
    return scoredCandidates[0]?.user || null
  }

  private isEligibleMatch(user: UserProfile, candidate: UserProfile): boolean {
    const userPrefs = user.preferences.matching
    const candidatePrefs = candidate.preferences.matching

    // Check if users have blocked each other
    if (user.preferences.privacy.blockList.includes(candidate.id) ||
        candidate.preferences.privacy.blockList.includes(user.id)) {
      return false
    }

    // Check recent matches to avoid immediate repeats
    const recentUserMatches = this.recentMatches.get(user.id) || []
    if (recentUserMatches.includes(candidate.id)) {
      return false
    }

    // Age range compatibility
    if (user.age && candidate.age) {
      if (user.age < candidatePrefs.ageRange.min || user.age > candidatePrefs.ageRange.max ||
          candidate.age < userPrefs.ageRange.min || candidate.age > userPrefs.ageRange.max) {
        return false
      }
    }

    // Chat type compatibility
    if (userPrefs.chatType !== 'both' && candidatePrefs.chatType !== 'both' &&
        userPrefs.chatType !== candidatePrefs.chatType) {
      return false
    }

    return true
  }

  private calculateCompatibilityScore(user: UserProfile, candidate: UserProfile): MatchingAlgorithm {
    const scores = {
      interests: this.calculateInterestScore(user, candidate),
      location: this.calculateLocationScore(user, candidate),
      language: this.calculateLanguageScore(user, candidate),
      availability: this.calculateAvailabilityScore(user, candidate),
      preferences: this.calculatePreferenceScore(user, candidate)
    }

    const weights = {
      interests: 0.3,
      location: 0.2,
      language: 0.2,
      availability: 0.15,
      preferences: 0.15
    }

    const compatibilityScore = Object.entries(scores).reduce(
      (total, [key, score]) => total + score * weights[key as keyof typeof weights],
      0
    )

    const reasoning = this.generateReasoningText(scores, user, candidate)

    return {
      compatibilityScore: Math.round(compatibilityScore * 100) / 100,
      factors: scores,
      reasoning
    }
  }

  private calculateInterestScore(user: UserProfile, candidate: UserProfile): number {
    const userInterests = new Set(user.interests.map(i => i.toLowerCase()))
    const candidateInterests = new Set(candidate.interests.map(i => i.toLowerCase()))
    
    const intersection = new Set(Array.from(userInterests).filter(x => candidateInterests.has(x)))
    const union = new Set([...Array.from(userInterests), ...Array.from(candidateInterests)])
    
    if (union.size === 0) return 0
    return intersection.size / union.size
  }

  private calculateLocationScore(user: UserProfile, candidate: UserProfile): number {
    if (!user.location || !candidate.location) return 0.5

    let score = 0
    
    // Same country bonus
    if (user.location.country === candidate.location.country) {
      score += 0.4
    }
    
    // Same city bonus
    if (user.location.city === candidate.location.city) {
      score += 0.3
    }
    
    // Timezone compatibility
    if (user.location.timezone === candidate.location.timezone) {
      score += 0.3
    }

    return Math.min(score, 1)
  }

  private calculateLanguageScore(user: UserProfile, candidate: UserProfile): number {
    const userLanguages = new Set(user.languages.map(l => l.toLowerCase()))
    const candidateLanguages = new Set(candidate.languages.map(l => l.toLowerCase()))
    
    const commonLanguages = new Set(Array.from(userLanguages).filter(x => candidateLanguages.has(x)))
    
    if (commonLanguages.size === 0) return 0
    
    // Bonus for English or major languages
    const majorLanguages = ['english', 'spanish', 'chinese', 'hindi', 'arabic']
    const hasMajorLanguage = Array.from(commonLanguages).some(lang => majorLanguages.includes(lang))
    
    return hasMajorLanguage ? 1 : 0.7
  }

  private calculateAvailabilityScore(user: UserProfile, candidate: UserProfile): number {
    // Simple availability based on when they joined the queue
    const userJoinTime = this.matchingQueue.get(user.id)
    const candidateJoinTime = this.matchingQueue.get(candidate.id)
    
    if (!userJoinTime || !candidateJoinTime) return 0.5
    
    const timeDiff = Math.abs(userJoinTime.getTime() - candidateJoinTime.getTime())
    const fiveMinutes = 5 * 60 * 1000
    
    // Higher score for users who joined around the same time
    return Math.max(0, 1 - (timeDiff / fiveMinutes))
  }

  private calculatePreferenceScore(user: UserProfile, candidate: UserProfile): number {
    const userPrefs = user.preferences.matching
    const candidatePrefs = candidate.preferences.matching
    
    let score = 0
    let factors = 0
    
    // Session length compatibility
    if (userPrefs.sessionLength === candidatePrefs.sessionLength) {
      score += 0.4
    } else if (userPrefs.sessionLength === 'unlimited' || candidatePrefs.sessionLength === 'unlimited') {
      score += 0.2
    }
    factors++
    
    // Maturity level compatibility
    if (userPrefs.maturityLevel === candidatePrefs.maturityLevel || 
        userPrefs.maturityLevel === 'all' || candidatePrefs.maturityLevel === 'all') {
      score += 0.3
    }
    factors++
    
    // Chat type preference
    if (userPrefs.chatType === candidatePrefs.chatType || 
        userPrefs.chatType === 'both' || candidatePrefs.chatType === 'both') {
      score += 0.3
    }
    factors++
    
    return factors > 0 ? score / factors : 0
  }

  private generateReasoningText(scores: any, user: UserProfile, candidate: UserProfile): string[] {
    const reasons: string[] = []
    
    if (scores.interests > 0.5) {
      reasons.push(`High interest compatibility (${Math.round(scores.interests * 100)}%)`)
    }
    
    if (scores.location > 0.7) {
      reasons.push('Good location match')
    }
    
    if (scores.language === 1) {
      reasons.push('Shares common languages')
    }
    
    if (scores.availability > 0.7) {
      reasons.push('Both available at similar times')
    }
    
    if (scores.preferences > 0.6) {
      reasons.push('Compatible chat preferences')
    }
    
    if (reasons.length === 0) {
      reasons.push('Basic compatibility match')
    }
    
    return reasons
  }

  public recordMatch(user1Id: string, user2Id: string): void {
    // Track recent matches to avoid immediate repeats
    const user1Recent = this.recentMatches.get(user1Id) || []
    const user2Recent = this.recentMatches.get(user2Id) || []
    
    user1Recent.push(user2Id)
    user2Recent.push(user1Id)
    
    // Keep only last 10 matches
    if (user1Recent.length > 10) user1Recent.shift()
    if (user2Recent.length > 10) user2Recent.shift()
    
    this.recentMatches.set(user1Id, user1Recent)
    this.recentMatches.set(user2Id, user2Recent)
  }

  public getQueueSize(): number {
    return this.matchingQueue.size
  }

  public getQueueInfo(): Array<{userId: string, waitTime: number}> {
    const now = new Date()
    return Array.from(this.matchingQueue.entries()).map(([userId, joinTime]) => ({
      userId,
      waitTime: now.getTime() - joinTime.getTime()
    }))
  }
} 