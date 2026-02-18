function Hjem({ rolle, brukerinfo }) {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Velkommen, {brukerinfo.navn}!</h1>
            <p>Du er logget inn som: <strong>{rolle}</strong></p>

            {rolle === "lege" && (
                <div>
                    <h2>Lege-dashboard</h2>
                    <p>AnsattID: {brukerinfo.ansattID}</p>
                    <p>Mail: {brukerinfo.mail}</p>
                    <p>Her kan legen se journaler, pasienter og mer...</p>
                </div>
            )}

            {rolle === "pasient" && (
                <div>
                    <h2>Pasient-dashboard</h2>
                    <p>Her kan pasienten se sin egen informasjon...</p>
                </div>
            )}
        </div>
    )
}

export default Hjem