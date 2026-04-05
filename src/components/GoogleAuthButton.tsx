import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { extractErrorMessage } from '@/api/apiClient'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Props {
  onSuccess?: () => void
}

export default function GoogleAuthButton({ onSuccess }: Props) {
  const { loginWithGoogle } = useAuthStore()

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Echec de la connexion Google')
      return
    }
    try {
      await loginWithGoogle(response.credential)
      toast.success('Connexion reussie !')
      onSuccess?.()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Echec de la connexion Google'))
    }
  }

  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error('Echec de la connexion Google')}
        shape="pill"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  )
}
