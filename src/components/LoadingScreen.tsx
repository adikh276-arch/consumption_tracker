const LoadingScreen = () => (
    <div className="sc-gradient min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-sc-midnight/10 border-t-sc-midnight rounded-full animate-spin mb-6"></div>
        <h2 className="sc-heading text-xl text-sc-midnight">Checking authorization...</h2>
        <p className="sc-body text-sm text-sc-midnight/50 mt-2">Please wait a moment.</p>
    </div>
);

export default LoadingScreen;
