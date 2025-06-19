import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Edit, Trash2, Crown } from 'lucide-react'
import type { Role } from '@/services/rbac'

interface RoleCardProps {
  role: Role
  onEdit?: (role: Role) => void
  onDelete?: (id: string) => void
  onAssign?: (roleId: string) => void
  showActions?: boolean
  userCount?: number
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete,
  onAssign,
  showActions = true,
  userCount = 0,
}) => {
  const getLevelColor = (level: number) => {
    if (level >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    if (level >= 70) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (level >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (level >= 30) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getLevelText = (level: number) => {
    if (level >= 90) return 'مستوى عالي جداً'
    if (level >= 70) return 'مستوى عالي'
    if (level >= 50) return 'مستوى متوسط'
    if (level >= 30) return 'مستوى أساسي'
    return 'مستوى محدود'
  }

  const getDisplayName = () => {
    if (role.display_name && typeof role.display_name === 'object') {
      return role.display_name.ar || role.display_name.en || role.name
    }
    return role.name
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {role.is_system ? (
              <Crown className="h-5 w-5 text-yellow-600" />
            ) : (
              <Shield className="h-5 w-5 text-blue-600" />
            )}
            {getDisplayName()}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getLevelColor(role.level)}>
              {getLevelText(role.level)}
            </Badge>
            {role.is_system && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                نظام
              </Badge>
            )}
          </div>
        </div>
        {role.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {role.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Role Level */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              مستوى الصلاحية
            </span>
            <span className="text-lg font-bold text-primary">
              {role.level}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${role.level}%` }}
            />
          </div>
        </div>

        {/* Permissions Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">الصلاحيات</span>
          </div>
          <Badge variant="outline">
            {role.permissions.length} صلاحية
          </Badge>
        </div>

        {/* User Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">المستخدمون</span>
          </div>
          <Badge variant="outline">
            {userCount} مستخدم
          </Badge>
        </div>

        {/* Permissions Preview */}
        {role.permissions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الصلاحيات الأساسية:
            </h4>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((permission, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {permission.split(':')[0]}
                </Badge>
              ))}
              {role.permissions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 3} أخرى
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Parent Role */}
        {role.parent_role_id && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            دور فرعي من: {role.parent_role_id}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onAssign && (
              <Button
                size="sm"
                onClick={() => onAssign(role.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                تعيين
              </Button>
            )}
            
            {onEdit && !role.is_system && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(role)}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                تعديل
              </Button>
            )}
            
            {onDelete && !role.is_system && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(role.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                حذف
              </Button>
            )}
          </div>
        )}

        {/* Creation Date */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
          تم الإنشاء: {new Date(role.created_at).toLocaleDateString('ar-SA')}
        </div>
      </CardContent>
    </Card>
  )
}