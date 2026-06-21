interface IllustrationProps {
  className?: string;
}

const Illustration = ({ className }: IllustrationProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 776.97 776.97"
      fill="none"
      strokeWidth="35px"
      stroke="orange"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M131.29 131.29h514.4v514.4h-514.4z"
        transform="rotate(-45 388.47684236 388.48762323)"
      />
      <path d="M131.31 131.25h514.4v514.4h-514.4z" />
    </svg>
  );
};

export default Illustration;
