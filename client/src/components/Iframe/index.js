import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import Frame from "react-frame-component";

const Iframe = ({ children, height: propsHeight }) => {
  const [height, setHeight] = useState(500);
  const iframeRef = useRef();
  const renderHead = () => {
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: document.head.innerHTML }} />
        <link rel="stylesheet" href="../OfferRequestForm/style.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </React.Fragment>
    );
  };
  const handleResize = useCallback(() => {
    if (
      iframeRef.current &&
      iframeRef.current.node.contentDocument &&
      iframeRef.current.node.contentDocument.body.scrollHeight !== 0
    ) {
      setHeight(iframeRef.current.node.contentDocument.body.scrollHeight + 4);
    }
  }, [iframeRef, setHeight]);
  useLayoutEffect(() => handleResize(), [children, iframeRef]);
  useEffect(() => {
    window.addEventListener("resize", () => {
      handleResize();
    });
  }, [iframeRef]);
  return (
    <Frame
      style={{
        height,
        width: "100%",
        overflow: "hidden",
      }}
      head={renderHead()}
      ref={iframeRef}
      onLoad={handleResize}
      seamless
    >
      {children}
    </Frame>
  );
};

export default Iframe;
