import React from 'react';
import withAuth from "../../../core/withAuth";
import UserProfile from '@/modules/auth/forms/userProfile';
 
function userProfile ({dispatch} ) {
    return (
    <UserProfile />
  )
}

export default withAuth(userProfile)