const Example = () => {
  return (
    <div className="w-full">
      <CutoutTextLoader
        height="600px"
        background="white"
        imgUrl="https://media.giphy.com/media/q1mHcB8wOCWf6/giphy.gif"
      />
    </div>
  );
};

const CutoutTextLoader = ({
  height,
  background,
  imgUrl,
}: {
  height: string;
  background: string;
  imgUrl: string;
}) => {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imgUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      {/* Overlay for light/dark mode */}
      <div
        className="absolute inset-0 z-10 transition-colors duration-500 
                   bg-white/70 dark:bg-black/70 backdrop-blur-sm"
      />

      {/* Cutout Text */}
      <span
        className="font-black z-20 text-center bg-clip-text text-transparent select-none"
        style={{
          backgroundImage: `url(${imgUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          fontSize: "clamp(3rem, 12vw, 10rem)",
          lineHeight: height,
        }}
      >
        Loading...
      </span>
    </div>
  );
};

export default Example;
