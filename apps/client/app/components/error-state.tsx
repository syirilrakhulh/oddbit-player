import { cx } from 'class-variance-authority';
import ErrorIcon from '~/assets/icons/error.svg?react';
import Button from './button';

interface ErrorStateProps {
  className?: string;
  title?: string;
  message?: string;
  actionTitle?: string;
  onClickAction: () => void;
}

const ErrorState = ({ className, title, message, actionTitle, onClickAction }: ErrorStateProps) => {
  return (
    <div className={cx('flex max-w-md flex-col items-center p-6 text-center', className)}>
      <ErrorIcon className="h-fit w-1/5 text-red-500" />
      <h3 className="mt-1 text-sm font-bold text-current">{title || 'Something Went Wrong'}</h3>
      <p className="mt-1 text-xs text-current">
        {message || 'An unexpected error occurred. Please try again later or contact support if the problem persists.'}
      </p>
      <Button onClick={onClickAction} variant="solid" className="mt-4">
        {actionTitle || 'Reload'}
      </Button>
    </div>
  );
};

export default ErrorState;
