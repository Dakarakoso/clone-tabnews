import Script from "next/script";

function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100dvw",
        height: "100dvh",
        overflowX: "hidden",
      }}
    >
      <h1>
        Raquel, Você é o amor da minha vida. Quero passar o resto da minha vida
        ao seu lado. Te amo! Se você me ama da uma risadinha!
      </h1>
      <span stye={{ color: "#970DC9" }}>Eu e voçê para sempre💗💗</span>

      <Script
        src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
        type="module"
      ></Script>

      <dotlottie-player
        src="https://lottie.host/4f2452f5-89ec-458d-866e-3da5f42465d6/cIQgoO65cD.json"
        background="transparent"
        speed="1"
        style={{ width: "800px", height: "500px" }}
        loop
        autoplay
      ></dotlottie-player>
      <footer>
        <span>&copy; Made by </span>
        <a target="_blank" href="https://github.com/dakarakoso">
          Willian Maruyama
        </a>
      </footer>
    </main>
  );
}

export default Home;
