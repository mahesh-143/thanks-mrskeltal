import { useEffect, useState, useRef, createRef } from "react";
import { socket } from "./socket";
import video from "./assets/video.mp4";

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function App() {
  const [thanksList, setThanksList] = useState([]);
  const [totalThanks, setTotalThanks] = useState();

  const scrollRefs = useRef([]);

  const scrollToElement = () => {
    if (scrollRefs.current) {
      scrollRefs.current.scrollTop = scrollRefs.current.scrollHeight;
    }
  };

  const sayThanks = () => {
    const user = JSON.parse(localStorage.getItem("skelUser"));
    if (user != null) {
      socket.emit("thanks", { username: user.username, color: user.color });
    } else {
      const newUserName = prompt("what's your name hooman?");
      if (newUserName) {
        const color = getRandomColor();
        const newUser = {
          username: newUserName,
          color: color,
        };
        localStorage.setItem("skelUser", JSON.stringify(newUser));
        socket.emit("thanks", { username: newUserName, color });
      }
    }
  };

  const onTotalThanks = (value) => {
    setTotalThanks(value);
  };

  useEffect(() => {
    socket.on("connect");
    socket.on("newUser", (newUser) => {
      setThanksList((prevThanks) => [...prevThanks, newUser]);
    });

    socket.on("totalThanks", onTotalThanks);

    scrollToElement();

    return () => {
      socket.off("newUser");
    };
  }, [thanksList]);

  return (
    <main className="wrapper">
      <h1 className="title">Thank Mr Skeltal</h1>
      <video width="750" height="500" loop autoPlay muted className="video">
        <source src={video} type="video/mp4" />
      </video>

      <div className="count">Total Thanks {totalThanks}</div>
      <ul className="chat" ref={scrollRefs}>
        {thanksList.map((userData, index) => (
          <li key={index} className="messgae">
            <span style={{ color: userData.color }} className="username">
              {userData.username}
            </span>{" "}
            thanked Mr Skeltal
          </li>
        ))}
      </ul>
      <button onClick={sayThanks}>Thank Mr Skeltal</button>
      <p>
        Made by <a href="https://github.com/mahesh-143">mahesh-143</a>
      </p>
      <p>
        Inspired from <a href="https://💀🎺.tk">💀🎺.tk</a>
      </p>
    </main>
  );
}

export default App;
