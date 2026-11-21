import { LoaderCircle } from "lucide-react";

function Loader() {
    return (
        <div className="app-loader" role="status" aria-live="polite">
            <LoaderCircle className="loader-icon" size={34} />
            <span>Loading SHOPORA...</span>
        </div>
    );
}

export default Loader;
