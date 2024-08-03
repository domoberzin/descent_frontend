import { Card } from "../../utils/Card";
import { CalloutChip } from "../../utils/CalloutChip";
import { SiTwitter } from "react-icons/si";
import { CornerBlur } from "../../utils/CornerBlur";

export const MiniCard2 = () => {
  return (
    <div className="col-span-2 h-[415px] sm:h-[375px] md:col-span-1">
      <Card>
        <CalloutChip>Student Success</CalloutChip>
        <p className="mb-1.5 text-2xl">Learn from Real Experiences</p>
        <p className="text-zinc-400">
          Discover how our platform has helped students and professionals master
          machine learning concepts.
        </p>

        <div className="absolute -bottom-2 left-2 right-2 z-10 h-44 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-3 flex gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
              alt="Placeholder image for user Sarah Chen"
              className="size-10 shrink-0 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold text-zinc-50">Sarah Chen</p>
              <p className="text-xs text-zinc-400">@sarahml_enthusiast</p>
            </div>
          </div>
          <p>
            <span className="font-semibold text-blue-300">@DescentAI</span>
            's interactive visualizations made understanding complex ML
            algorithms a breeze! The hands-on challenges really solidified my
            knowledge. Highly recommend! 🚀🧠
          </p>

          <SiTwitter className="absolute right-4 top-4 text-[#1F9AF1]" />
        </div>

        <CornerBlur />
      </Card>
    </div>
  );
};
