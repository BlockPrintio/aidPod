// Type declarations for JSX components that haven't been converted yet
declare module 'components/AppIcon' {
  import { ComponentType } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
    [key: string]: unknown;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module 'components/ui/Button' {
  import { ComponentType, ReactNode } from 'react';
  interface ButtonProps {
    variant?: string;
    size?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }
  const Button: ComponentType<ButtonProps>;
  export default Button;
}

declare module 'components/WalletConnector' {
  import { ComponentType } from 'react';
  interface WalletConnectorProps {
    onWalletChange?: (wallet: unknown) => void;
    [key: string]: unknown;
  }
  const WalletConnector: ComponentType<WalletConnectorProps>;
  export default WalletConnector;
}

declare module './components/AppIcon' {
  import { ComponentType } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
    [key: string]: unknown;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module './components/ui/Button' {
  import { ComponentType, ReactNode } from 'react';
  interface ButtonProps {
    variant?: string;
    size?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }
  const Button: ComponentType<ButtonProps>;
  export default Button;
}

declare module './components/WalletConnector' {
  import { ComponentType } from 'react';
  interface WalletConnectorProps {
    onWalletChange?: (wallet: unknown) => void;
    [key: string]: unknown;
  }
  const WalletConnector: ComponentType<WalletConnectorProps>;
  export default WalletConnector;
}

declare module '../components/AppIcon' {
  import { ComponentType } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
    [key: string]: unknown;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module '../components/ui/Button' {
  import { ComponentType, ReactNode } from 'react';
  interface ButtonProps {
    variant?: string;
    size?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
    [key: string]: unknown;
  }
  const Button: ComponentType<ButtonProps>;
  export default Button;
}

declare module '../components/WalletConnector' {
  import { ComponentType } from 'react';
  interface WalletConnectorProps {
    onWalletChange?: (wallet: unknown) => void;
    [key: string]: unknown;
  }
  const WalletConnector: ComponentType<WalletConnectorProps>;
  export default WalletConnector;
}

