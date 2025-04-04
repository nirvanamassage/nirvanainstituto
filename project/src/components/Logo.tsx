import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center pl-0 ${className}`}>
      <img 
        src="/nirvana-logo.png" 
        alt="Nirvana Spa Institute" 
        className="h-40 w-auto"
      />
    </Link>
  );
};

export default Logo; 