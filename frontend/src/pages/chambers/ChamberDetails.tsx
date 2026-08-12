import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store/store"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchMyChamberById } from "../../store/actions/chamberActions"

const ChamberDetails = () => {
    const [error, setError] = useState<string>("");
    const [status, setStatus] = useState<'error' | 'success' | 'idle' | 'loading'>('idle');

    const dispatch = useDispatch<AppDispatch>()
    const chamber = useSelector((state: RootState) => state.chamber.currentChamber)
    const params = useParams()

    const chamberId = params.chamberId


    useEffect(() => {
        if (!chamberId) {
            return
        }
        (async () => {
            try {
                setStatus('loading')
                await dispatch(fetchMyChamberById(chamberId))
                setStatus('success')
            } catch (error) {
                setStatus('error')
                if (error instanceof Error) {
                    setError(error.message)
                } else {
                    setError('Could not fetch chamber data')
                }
            }
        })()
    }, [chamberId])


    return (
        <>
            {status === 'error' && <div>{error}</div>}
            {status === 'loading' && <div>loading...</div>}
            <div>
                <h1>{chamber?.name}</h1>
                <h1>{chamber?.description}</h1>
                <div>
                    <h1>
                        Members
                    </h1>
                    {
                        chamber?.memberships.map((member) => (
                            <div key={member.id}>
                                <h3>{member.user.firstName + ' ' + member.user.lastName}</h3>
                                <h5>{member.user.userName}</h5>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}

export default ChamberDetails