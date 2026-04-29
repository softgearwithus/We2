import type { SVGAttributes } from "react";

const Logo = (props: SVGAttributes<SVGElement> & { className?: string }) => {
  return (
    <div className={`flex items-center ${props.className || ''}`}>
      <span className="font-black text-2xl tracking-tighter text-[#202b20]">
        EMBLE<span className="text-[#ffa116]"></span>
      </span>
    </div>
  );
};

export default Logo;
