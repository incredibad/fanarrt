// Three-star icon: large central star with two smaller flanking stars
// Used to indicate an item is starred in the active collection AND at least one other collection
export default function MultiStarIcon({ size = 24, fill = 'none', stroke = 'currentColor', strokeWidth = 2 }) {
  const smallFill = fill !== 'none' ? fill : stroke
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Small star — top left */}
      <polygon
        points="3.5,1 4.3,3.4 6.9,3.5 4.9,5 5.6,7.4 3.5,6 1.4,7.4 2.1,5 0.1,3.5 2.7,3.4"
        fill={smallFill}
        opacity="0.7"
      />
      {/* Small star — top right */}
      <polygon
        points="20.5,1 21.3,3.4 23.9,3.5 21.9,5 22.6,7.4 20.5,6 18.4,7.4 19.1,5 17.1,3.5 19.7,3.4"
        fill={smallFill}
        opacity="0.7"
      />
      {/* Main star */}
      <polygon
        points="12,8.5 13.5,13 18.3,13.2 14.6,15.9 15.9,20.5 12,17.9 8.1,20.5 9.4,15.9 5.7,13.2 10.5,13"
        fill={fill}
        stroke={fill === 'none' ? stroke : 'none'}
        strokeWidth={fill === 'none' ? strokeWidth : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}
