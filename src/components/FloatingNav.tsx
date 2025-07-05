import Image from "next/image";
import Link from "next/link";
import blackTypo from "../assets/blackTypo.svg";

const FloatingNav = ({
  isCollection = false,
  title,
  name,
  date,
  numItems,
}: {
  isCollection?: boolean;
  title?: string;
  name?: string;
  date?: string;
  numItems?: number;
}) => {
  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[393px] md:max-w-[1440px] px-3 md:px-6 py-0 md:py-6 flex justify-between items-center backdrop-blur-[50px] z-50">
      {isCollection ? (
        <div className="flex items-center gap-4">
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
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-lg md:text-[22px] line-clamp-1 text-primary">
              {title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-semibold">{name}</span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">
                {numItems} items
              </span>
              <span className="text-xs text-primary font-mono">•</span>
              <span className="text-xs text-[#7E7E7E] font-mono">{date}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </nav>
  );
};

export default FloatingNav;
