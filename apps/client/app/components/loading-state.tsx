import { cx } from 'class-variance-authority';

interface LoadingStateProps {
  className?: string;
  title?: string;
}

const LoadingState = ({ className, title }: LoadingStateProps) => {
  return (
    <div className={cx('flex flex-col items-center', className)}>
      <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-current" />
      <p className="mt-4 text-current">{title || 'Loading...'}</p>
    </div>
  );
};

export default LoadingState;
