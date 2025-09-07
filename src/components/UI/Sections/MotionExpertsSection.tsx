import MotionExpertsCard from "../Cards/MotionExpertsCard";

const MotionExpertsSection = () => {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Unsere Motion-Experten</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MotionExpertsCard />
        <MotionExpertsCard />
        <MotionExpertsCard />
      </div>
    </section>
  );
};

export default MotionExpertsSection;
