import React from "react";
import {
  FiCalendar,
  FiCheck,
  FiCloud,
  FiDollarSign,
  FiMoon,
  FiWatch,
} from "react-icons/fi";

export const SimpleGrid = () => (
  <div className="relative z-10 grid grid-cols-2 gap-9 px-3 md:grid-cols-3 md:gap-12 md:px-6">
    <Item
      Icon={FiCalendar}
      title="Interactive Coding Challenges"
      subtitle="Practice real-world machine learning problems with interactive coding challenges. Get instant feedback and improve your skills."
    />
    <Item
      Icon={FiWatch}
      title="Comprehensive Solutions"
      subtitle="Access detailed solutions and explanations for each challenge to understand the best practices and techniques in machine learning."
    />
    <Item
      Icon={FiMoon}
      title="Progress Tracking"
      subtitle="Monitor your progress over time with personalized dashboards and set goals to stay motivated and on track."
    />
    <Item
      Icon={FiDollarSign}
      title="Peer Collaboration"
      subtitle="Collaborate with a community of learners. Discuss challenges, share solutions, and learn together."
    />
    <Item
      Icon={FiCloud}
      title="Real-time Code Execution"
      subtitle="Write, test, and run your code in a real-time environment directly on the platform, with support for multiple programming languages."
    />
    <Item
      Icon={FiCheck}
      title="Expert-Led Tutorials"
      subtitle="Learn from industry experts through curated tutorials and video lessons. Gain insights from professionals in the field."
    />
  </div>
);

const Item = ({ Icon, title, subtitle }) => {
  return (
    <div>
      <h4 className="mb-1.5 flex items-start text-lg font-medium md:text-xl">
        <Icon className="mr-1.5 h-[26px] text-blue-300" />
        {title}
      </h4>
      <p className="text-sm text-zinc-400 md:text-base">{subtitle}</p>
    </div>
  );
};
