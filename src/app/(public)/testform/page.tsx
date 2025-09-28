export default function TestForm() {
  return (
    <main className="w-screen h-screen max-h-screen max-w-screen flex justify-center items-center bg-indigo-200 p-4">
      <div className="flex flex-col justify-center items-center h-screen">
        Test Form Page – Wow voll leer hier!
        <StudioHostSchritt1 />
      </div>
    </main>
  );
}

// StudioHost
const StudioHostSchritt1 = () => {
  return (
    <div className="flex w-fit bg-white rounded-2xl shadow-2xl">
      <input />
    </div>
  );
};
