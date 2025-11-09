import { Award, Star, TrendingUp, Crown } from 'lucide-react'

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface LoyaltyBadgeProps {
  tier: LoyaltyTier
  points: number
  size?: 'sm' | 'md' | 'lg'
  showPoints?: boolean
}

const tierConfig = {
  bronze: {
    color: 'from-amber-700 to-amber-900',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-900',
    icon: Award,
    name: 'Bronze',
    minPoints: 0,
    nextTier: 'Silver',
    nextTierPoints: 500,
  },
  silver: {
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-900',
    icon: Star,
    name: 'Silver',
    minPoints: 500,
    nextTier: 'Gold',
    nextTierPoints: 1500,
  },
  gold: {
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-900',
    icon: TrendingUp,
    name: 'Gold',
    minPoints: 1500,
    nextTier: 'Platinum',
    nextTierPoints: 3000,
  },
  platinum: {
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-900',
    icon: Crown,
    name: 'Platinum',
    minPoints: 3000,
    nextTier: null,
    nextTierPoints: null,
  },
}

export default function LoyaltyBadge({ tier, points, size = 'md', showPoints = true }: LoyaltyBadgeProps) {
  const config = tierConfig[tier]
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-6 h-6',
      text: 'text-xs',
      points: 'text-lg',
    },
    md: {
      container: 'w-24 h-24',
      icon: 'w-10 h-10',
      text: 'text-sm',
      points: 'text-2xl',
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'w-16 h-16',
      text: 'text-base',
      points: 'text-3xl',
    },
  }

  const sizes = sizeClasses[size]

  // Calculate progress to next tier
  const progress = config.nextTierPoints
    ? ((points - config.minPoints) / (config.nextTierPoints - config.minPoints)) * 100
    : 100

  return (
    <div className="flex flex-col items-center">
      {/* Badge Circle */}
      <div className="relative">
        <div
          className={`${sizes.container} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
        >
          <Icon className={`${sizes.icon} text-white`} />
        </div>
        
        {/* Tier Label */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <span
            className={`${config.bgColor} ${config.textColor} px-3 py-1 rounded-full ${sizes.text} font-bold shadow-sm border-2 border-white`}
          >
            {config.name}
          </span>
        </div>
      </div>

      {/* Points Display */}
      {showPoints && (
        <div className="mt-6 text-center">
          <p className={`${sizes.points} font-bold text-gray-900`}>{points.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Loyalty Points</p>

          {/* Progress to Next Tier */}
          {config.nextTier && config.nextTierPoints && (
            <div className="mt-3 w-48">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{config.name}</span>
                <span>{config.nextTier}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${config.color} h-2 rounded-full transition-all`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {config.nextTierPoints - points} points to {config.nextTier}
              </p>
            </div>
          )}

          {tier === 'platinum' && (
            <p className="text-xs text-purple-600 font-semibold mt-2">🎉 Highest Tier Achieved!</p>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to determine tier from points
export function getTierFromPoints(points: number): LoyaltyTier {
  if (points >= 3000) return 'platinum'
  if (points >= 1500) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

