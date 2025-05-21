import { cva, type VariantProps } from 'class-variance-authority';

const button = cva(
  'cursor-pointer outline-0 outline-offset-0 outline-transparent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
  {
    variants: {
      variant: {
        'icon-only':
          'rounded-full p-1 text-current transition-colors duration-300 hover:bg-current/25 focus-visible:bg-current/25',
        solid:
          'rounded bg-emerald-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-emerald-700 focus-visible:bg-emerald-700',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
    },
  },
);

interface ButtonProps extends VariantProps<typeof button> {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ children, variant = 'solid', disabled = false, className, onClick }: ButtonProps) => {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={button({ variant, className, disabled })}>
      {children}
    </button>
  );
};

export default Button;
