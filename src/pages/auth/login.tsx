import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '@/components/organisms/Layout'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { signIn, signInWithOAuth, isSigningIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    signIn(data, {
      onSuccess: () => {
        router.push('/dashboard')
      },
    })
  }

  const handleOAuthSignIn = (provider: 'google' | 'github' | 'apple') => {
    signInWithOAuth(provider)
  }

  return (
    <Layout showNavbar={false} showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              تسجيل الدخول
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-400">
              أدخل بيانات حسابك للوصول إلى المنصة
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="البريد الإلكتروني"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isSigningIn}
                className="bg-primary hover:bg-primary/90"
              >
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    أو
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-full"
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn('apple')}
                  className="w-full"
                >
                  Apple
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              ليس لديك حساب؟{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default LoginPage