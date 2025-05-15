export default function Mascot({ className }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFD700"
        d="M100 20c44.2 0 80 35.8 80 80s-35.8 80-80 80-80-35.8-80-80 35.8-80 80-80z"
      />
      <circle cx="80" cy="80" r="20" fill="#fff" />
      <circle cx="120" cy="80" r="20" fill="#fff" />
      <circle cx="85" cy="80" r="10" fill="#000" />
      <circle cx="115" cy="80" r="10" fill="#000" />
      <path
        fill="none"
        stroke="#000"
        strokeWidth="8"
        d="M60 140 Q100 160 140 140"
      />
    </svg>
  );
}