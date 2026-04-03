// Main star matches lucide Star, with two small accent stars in upper corners
// Used to indicate an item is starred in the active collection AND at least one other collection
export default function MultiStarIcon({ size = 24, fill = 'none', stroke = 'currentColor', strokeWidth = 2 }) {
  const accentFill = fill !== 'none' ? fill : stroke
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Small accent star — top left */}
      <polygon
        points="4.5,1.5 4.95,2.89 6.4,2.88 5.22,3.73 5.68,5.12 4.5,4.26 3.32,5.12 3.78,3.73 2.6,2.88 4.05,2.89"
        fill={accentFill}
        opacity="0.75"
      />
      {/* Small accent star — top right */}
      <polygon
        points="19.5,1.5 19.95,2.89 21.4,2.88 20.22,3.73 20.68,5.12 19.5,4.26 18.32,5.12 18.78,3.73 17.6,2.88 19.05,2.89"
        fill={accentFill}
        opacity="0.75"
      />
      {/* Main star — same shape as lucide Star */}
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={fill}
        stroke={fill === 'none' ? stroke : 'none'}
        strokeWidth={fill === 'none' ? strokeWidth : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}
