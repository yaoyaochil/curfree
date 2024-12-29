import Header from "./components/Header";
import Info from "./components/Info";

function App() {
  return (
    <div className="rounded-lg h-screen w-screen p-4 pt-2 bg-background text-text flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Info />
      </div>
    </div>
  );
}

export default App;
