import { FC } from "react";

const Loading: FC = () => {
  return (
    <div className="contentBox flexColumn allignCenter">
      <h1>Connecting...</h1>
      <img className="spinning" src="images/loading.png" alt="Loading" />
    </div>
  );
};

export default Loading;