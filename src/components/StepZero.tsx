import { useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import brid from "../assets/brid.svg";
import links from "../assets/chain.svg";
import whitelinks from "../assets/whitechain.svg";
import plusIcon from "../assets/plus.svg";
import Image from "next/image";

function StepZero({ handleNext }: { handleNext: () => void }) {
  const [selectedToken1, setSelectedToken1] = useState("token1");

  // Use motion values for smooth animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create springs for smooth return animation
  const springX = useSpring(x, {
    stiffness: 400,
    damping: 50,
  });

  const springY = useSpring(y, {
    stiffness: 400,
    damping: 50,
  });

  return (
    <div className="w-full h-full flex justify-center items-center flex-col pb-16 relative">
      <motion.div
        className="w-[345px] mx-auto"
        drag
        dragMomentum={false}
        style={{
          x: springX,
          y: springY,
        }}
        onDrag={(_, info) => {
          x.set(info.offset.x);
          y.set(info.offset.y);
        }}
        onDragEnd={() => {
          // Animate back to initial position
          x.set(0);
          y.set(0);
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <article className="bg-gradient-to-b from-[#3076FF] to-[#1D49E5] text-white text-[17px] pt-3 rounded-2xl">
          <div className="px-3 font-light">
            Typo is the best way to share your ideas. <br />
            They can be{" "}
            <button
              onClick={() => setSelectedToken1("token1")}
              className={`inline-flex items-center gap-0.5 text-xs py-1 px-2 rounded-3xl w-fit cursor-pointer ${
                selectedToken1 === "token1"
                  ? "bg-white text-secondary"
                  : "bg-[#FFFFFF33] text-white"
              }`}
            >
              <div className="tokenPill">
                <div className="thumbnail">
                  <Image
                    src={brid}
                    alt="Token Thumbnail"
                    className="thumbnailImg"
                  />
                </div>
                <span>video.mp4</span>
              </div>
            </button>{" "}
            <button
              onClick={() => setSelectedToken1("token2")}
              className={`inline-flex items-center gap-0.5 text-xs py-1 px-2 rounded-3xl w-fit cursor-pointer ${
                selectedToken1 === "token2"
                  ? "bg-white text-secondary"
                  : "bg-[#FFFFFF33] text-white"
              }`}
            >
              <div className="tokenPill">
                <div className="thumbnail">
                  <Image
                    src={brid}
                    alt="Token Thumbnail"
                    className="thumbnailImg"
                  />
                </div>
                <span>songs.mp3</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedToken1("token3")}
              className={`inline-flex items-center gap-0.5 text-xs py-1 px-2 rounded-3xl w-fit cursor-pointer ${
                selectedToken1 === "token3"
                  ? "bg-white text-secondary"
                  : "bg-[#FFFFFF33] text-white"
              }`}
            >
              <div className="tokenPill">
                <div className="thumbnail">
                  <Image
                    src={selectedToken1 === "token3" ? links : whitelinks}
                    alt="Links icon"
                  />
                </div>
                <span>links</span>
              </div>
            </button>{" "}
            or all of the above... Upload and share up to 5GBs for free
          </div>
          <div className="bubble-bottom mt-2 translate-y-2">
            <Image
              src={brid}
              alt="Whiteboarding"
              style={{
                width: "100%",
              }}
            />
          </div>
        </article>
      </motion.div>
      <button
        onClick={handleNext}
        className="bg-[#F3F3F3BF] text-primary px-4 py-2.5 rounded-full flex items-center font-semibold absolute bottom-12"
      >
        <Image src={plusIcon} alt="plus icon" className="inline-block mr-2" />
        Create an idea
      </button>
    </div>
  );
}

export default StepZero;
