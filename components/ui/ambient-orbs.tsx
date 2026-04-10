export function AmbientOrbs() {
  return (
    <>
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(193,155,46,0.08), transparent 70%)",
          top: -200,
          left: -200,
          filter: "blur(80px)",
          animation: "drift1 18s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(45,74,110,0.15), transparent 70%)",
          bottom: 0,
          right: -100,
          filter: "blur(80px)",
          animation: "drift2 22s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(155,58,31,0.06), transparent 70%)",
          top: "40%",
          left: "50%",
          filter: "blur(80px)",
          animation: "drift3 15s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    </>
  );
}
