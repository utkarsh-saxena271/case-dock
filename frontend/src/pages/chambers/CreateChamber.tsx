import React, { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store/store"
import { useNavigate } from "react-router-dom"
import { createChamber } from "../../store/actions/chamberActions"

const CreateChamber = () => {
    const [status, setStatus] = useState<'idle' | 'error' | 'loading' | 'success'>('idle')
    const [error, setError] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const createChamberHandler = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setStatus('loading')
            const createChamberPayload = {
                name, description
            }
            const res = await dispatch(createChamber(createChamberPayload))
            setStatus('success')
            setTimeout(() => {
                navigate(`/chamber/${res.id}`)
            }, 1500);
        } catch (error) {
            setStatus('error')
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('Error in creating chamber')
            }
        }
    }
    return (
        <>
            {status === 'loading' && <div>Loading...</div>}
            {status === 'error' && <div>{error}</div>}
            {status === 'success' && <div>Chamber created successfully</div>}
            <form onSubmit={createChamberHandler}>
                <input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    value={name}
                    type="text"
                    placeholder="name" required={true} />
                <input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    value={description}
                    type="text"
                    placeholder="description" />
                <button disabled={status === 'loading'}>
                    {status === 'loading' ? 'Creating...' : 'Create Chamber'}
                </button>
            </form>
        </>
    )
}

export default CreateChamber