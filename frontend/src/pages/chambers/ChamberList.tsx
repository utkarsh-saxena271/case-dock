import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../store/store"
import { useEffect, useState } from "react"
import { fetchMyChambers } from "../../store/actions/chamberActions"
import { Link } from "react-router-dom"

const ChamberList = () => {
  const [status, setStatus] = useState<'loading' | 'empty' | 'idle' | 'error'>('idle') 
  const [error, setError] = useState<string>('')
  const chambers = useSelector((state: RootState) => state.chamber.chambers)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    (async () => {
      try {
        setStatus('loading')
        const result = await dispatch(fetchMyChambers())
        if (result.length === 0) {
          setStatus('empty')
        }else{
          setStatus('idle')
        }
      } catch (error) {
        setStatus('error')
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('Error in fetching chambers')
        }
      }
    })()
  }, [])
  return (
    <>
      <div>
        <Link to={'/chamber/create'}>Create Chamber</Link>
        <Link to={'/chamber/discover'}>Discover Chamber</Link>
      </div>
      {status === 'empty' && <div>You have not joined any chambers</div>}
      {status === 'error' && <div>{error}</div>}
      {status === 'loading' && <div>Loading...</div>}
      <div>
        {status === 'idle' &&
        chambers.map(chamber => (
          <Link to={`/chamber/${chamber.id}`} key={chamber.id}>
            <h1>{chamber.name}</h1>
            <p>
              {chamber.description}
            </p>
          </Link>
        ))
      }
      </div>
    </>
  )
}

export default ChamberList