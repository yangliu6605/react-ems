import { useNavigate } from 'react-router-dom' 

const HeaderComponent = () => {

    const navigator = useNavigate();

    function backToList() {
      navigator('/')
    }

    return (
        <header>
            <nav className="navbar navbar-dark bg-dark">
                <span className="navbar-brand" onClick={backToList}>Employee Management System</span>
            </nav>
        </header>
    )
}

export default HeaderComponent