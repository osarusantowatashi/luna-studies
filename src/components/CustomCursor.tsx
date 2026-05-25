import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", moveCursor);

    const hoverElements = document.querySelectorAll(
      "button, a, .cursor-hover"
    );

    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);

      hoverElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        animate={{
          x: position.x - 22,
          y: position.y - 22,
          scale: isHovering ? 1.35 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-11 w-11 rounded-full border-2 border-[#8d73ff] bg-[#8d73ff]/10 backdrop-blur-[2px]"
      />

      <motion.div
        animate={{
          x: position.x - 5,
          y: position.y - 5,
          scale: isHovering ? 1.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-2.5 w-2.5 rounded-full bg-[#8d73ff] shadow-[0_0_18px_rgba(141,115,255,0.75)]"
      />
    </>
  );
};

export default CustomCursor;