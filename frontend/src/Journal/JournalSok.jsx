import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// Når legen velger en pasient:
function velgPasient(pasient) {
    navigate(`/journal/${pasient.fnr}`)
    
    const token = sessionStorage.getItem("token")

    const respons = await fetch(`http://127.0.0.1:8000/journal/${fnr}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}

<li onClick={() => velgPasient(pasient)}>
    {pasient.navn}
</li>

