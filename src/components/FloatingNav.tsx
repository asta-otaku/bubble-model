import Image from 'next/image';
import Link from 'next/link';
import blackTypo from '../assets/blackTypo.svg';

const FloatingNav = () => {
  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] md:max-w-[1440px] px-3 md:px-6 py-0 md:py-6 flex justify-between items-center backdrop-blur-[50px] z-50">
      {/* Logo Container */}
      <Link 
        href="https://www.typo.inc" 
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-11 h-11 justify-center items-center gap-2.5 flex-shrink-0"
      >
        <Image
          src={blackTypo}
          alt="Typo Logo"
          width={44}
          height={44}
          priority
        />
      </Link>

      {/* Get the App Button */}
      <Link 
        href="https://apps.apple.com/us/app/typo/id6717573143" 
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 px-3 justify-center items-center gap-3 rounded-[100px] bg-[rgba(235,235,235,0.75)]"
      >
        <span className="font-sans text-[15px] font-semibold leading-5 tracking-[-0.5px] bg-gradient-to-b from-[#3076FF] to-[#1D49E5] bg-clip-text text-transparent">
          Get the app
        </span>
      </Link>
    </nav>
  );
};

export default FloatingNav; 