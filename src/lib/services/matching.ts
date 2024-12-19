import type { UserProfile, MatchPreferences } from '../types/user'

export class MatchingService {
  private userQueues: Map<string, UserProfile> = new Map()

  addToQueue(user: UserProfile): void {
    this.userQueues.set(user.id, user)
  }

  removeFromQueue(userId: string): void {
    this.userQueues.delete(userId)
  }

  findMatch(user: UserProfile): UserProfile | null {
    for (const [potentialMatchId, potentialMatch] of Array.from(this.userQueues)) {
      if (
        potentialMatchId !== user.id &&
        this.areUsersCompatible(user, potentialMatch)
      ) {
        this.removeFromQueue(potentialMatchId)
        return potentialMatch
      }
    }
    return null
  }

  private areUsersCompatible(user1: UserProfile, user2: UserProfile): boolean {
    // Check if either user has blocked the other
    if (
      user1.blockedUsers.includes(user2.id) ||
      user2.blockedUsers.includes(user1.id)
    ) {
      return false
    }

    // Check age preferences
    if (
      !this.isWithinAgeRange(user1.age, user2.preferences.ageRange) ||
      !this.isWithinAgeRange(user2.age, user1.preferences.ageRange)
    ) {
      return false
    }

    // Check location preferences if specified
    if (
      user1.preferences.location &&
      user2.preferences.location &&
      user1.location !== user2.preferences.location
    ) {
      return false
    }

    // Check for common interests
    const commonInterests = user1.interests.filter(interest =>
      user2.interests.includes(interest)
    )
    if (commonInterests.length === 0) {
      return false
    }

    return true
  }

  private isWithinAgeRange(age: number, range: [number, number]): boolean {
    return age >= range[0] && age <= range[1]
  }
} 