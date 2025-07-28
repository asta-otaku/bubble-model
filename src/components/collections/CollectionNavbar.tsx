import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import blackTypo from "@/assets/blackTypo.svg";
import { truncateFilename } from "../TruncateText";
import useIsMobile from "@/utils";

interface BreadcrumbNavProps {
  activeSubCollection: any | null;
  parentLevel: { id: string; name: string; type: string } | null;
  displayTitle: string;
  onBackToParent: () => void;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  activeSubCollection,
  parentLevel,
  displayTitle,
  onBackToParent,
}) => {
  if (!activeSubCollection || !parentLevel) return null;
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 z-[100]">
      <button
        onClick={onBackToParent}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} />
        <span className="text-inherit max-w-20 md:max-w-full w-full truncate">
          {truncateFilename(parentLevel.name, isMobile)}
        </span>
      </button>
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-medium">{displayTitle}</span>
    </div>
  );
};

interface CollectionNavbarProps {
  showTopGradient: boolean;
  breadcrumbProps: BreadcrumbNavProps;
}

const CollectionNavbar: React.FC<CollectionNavbarProps> = ({
  showTopGradient,
  breadcrumbProps,
}) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 px-3 md:px-6 py-4 md:py-6 flex justify-between items-center z-50 transition-all duration-300 ${
        showTopGradient
          ? "h-28 bg-gradient-to-b from-white/90 via-gray-50/70 to-transparent backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center gap-4 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link
            href="https://www.typo.inc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-11 h-11 justify-center items-center gap-2.5 flex-shrink-0 z-[100]"
          >
            <Image
              src={blackTypo}
              alt="Typo Logo"
              width={44}
              height={44}
              priority
            />
          </Link>
          <BreadcrumbNav {...breadcrumbProps} />
        </div>
      </div>
    </nav>
  );
};

export default CollectionNavbar;
