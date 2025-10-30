import clsx from "clsx";

const TeamMagicCardsSection = () => {
  return (
    <div className="flex flex-col md:flex-row w-full justify-center items-center relative mt-52 mb-52 p-16">
      <TeamMagicCardInfo
        title="Motion Experts"
        description="Experts in motion and choreography."
      />
      <TeamMagicCardFull videoSrc="/sport-dummy-video.mp4" />
      <TeamMagicCardInfo
        title="Athletes"
        description="Professional athletes and trainers."
      />
      <TeamMagicCardFull videoSrc="/yogadummy.mp4" />
      <TeamMagicCardInfo
        title="Studio Hosts"
        description="Hosts for our studio sessions."
      />
      <TeamMagicCardFull videoSrc="/health-dummy.mp4" />
    </div>
  );
};

export default TeamMagicCardsSection;

const TeamMagicCardInfo = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div
      className={clsx(
        "relative flex flex-col justify-end bg-yuvi-skyblue rounded-4xl aspect-[2/3] w-full max-w-[480px] m-4 p-4 text-white text-2xl font-semibold hover:z-10 cursor-pointer transition-transform duration-300 hover:bg-yuvi-rose hover:scale-110 rotate-12 hover:rotate-0"
      )}
    >
      <h3 className="text-6xl font-semibold">{title}</h3>
      <div className="border-t border-2 border-white my-4" />
      <p>{description}</p>
    </div>
  );
};

const TeamMagicCardFull = ({ videoSrc }: { videoSrc: string }) => {
  return (
    <div
      className={clsx(
        "relative flex bg-yuvi-blue rounded-4xl aspect-[2/3] w-full max-w-[480px] m-4 p-4 text-white text-2xl font-semibold justify-between cursor-pointer transition-transform duration-300 hover:z-10 hover:scale-110 overflow-hidden -rotate-12 hover:-rotate-0"
      )}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover scale-130"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};
