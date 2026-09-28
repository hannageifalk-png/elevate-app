type SkeletonBarProps = {
  height?: number;
  width?: string;
};

function SkeletonBar({ height = 16, width = "100%" }: SkeletonBarProps) {
  return <div className="skeleton" style={{ height, width }} />;
}

export default SkeletonBar;
