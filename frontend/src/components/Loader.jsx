// A small reusable loading spinner.
// The spinning circle itself is made purely with CSS
// (see the .spinner rule in index.css).
function Loader({ text = "Loading..." }) {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}

export default Loader;
