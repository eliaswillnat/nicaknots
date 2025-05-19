type Props = {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  className?: string;
};

const CupInside = ({ color, onClick, isSelected, className }: Props) => (
  <g style={{ transform: 'matrix(.87998, 0, 0, .87998, 24.383, -344.911)' }}>
    <g className={`${isSelected ? 'bounce-once' : ''} ${className ?? ''}`} onClick={onClick}>
      <path
        d="M498.255 1228.05c-105.928 45.52-490.498 91.76-464.249-7.17 18.157-68.44 45.006-288.577 188.79-388.306 49.96-34.652 282.387 256.396 302.148 354.596 1.133-.15 2.272-.28 3.415-.4 11.092-1.18 22.487-1.08 33.145.9 15.361-70.15 93.046-240.216 254.776-352.721 10.045-6.988 18.474-7.923 24.293-3.34C896.87 875.948 1094.08 1182.29 1038.46 1262c-39.114 56.04-409.988 24.39-471.265-36.69-9.707-6.01-22.896-5.95-35.231-4.64-13.013 1.38-25.362 4.72-33.709 7.38"
        fill={color}
      />
    </g>
  </g>
);

export default CupInside;
