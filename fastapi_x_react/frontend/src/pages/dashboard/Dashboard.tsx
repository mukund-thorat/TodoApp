import ProtectedRoute from "../../hooks/ProtectedRoute.tsx";
import Header from "./Header.tsx";
import Todos from "./Todos.tsx";

function DashboardPage(){
    return (
        <ProtectedRoute>
            <div className="p-12">
                <Header />
                <Todos />
            </div>
        </ProtectedRoute>
    )
}

export default DashboardPage;