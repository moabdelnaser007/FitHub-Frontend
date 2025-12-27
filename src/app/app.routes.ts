import { Routes } from '@angular/router';
import { HomeComponent } from './features/landing/components/home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { BusinessRegisterComponent } from './features/auth/components/business-register/business-register.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './features/auth/components/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { FindGymComponent } from './features/user/components/gyms/find-gym.component';
import { GymDetailComponent } from './features/user/components/gyms/gym-detail/gym-detail.component';
import { DashboardComponent } from './features/user/components/dashboard/dashboard.component';
import { ProfileComponent } from './features/user/components/profile/profile.component';
import { BookingConfirmationComponent } from './features/user/components/bookings/booking-confirmation.component';
import { SubscriptionsComponent } from './features/user/components/subscriptions/subscriptions.component';
import { ManageSubscriptionComponent } from './features/user/components/subscriptions/manage-subscription/manage-subscription.component';
import { BookingHistoryComponent } from './features/user/components/booking-history/booking-history.component';
import { BillingComponent } from './features/user/components/billing/billing.component';
import { ChoosePlanPaymentComponent } from './features/user/components/choose-plan-payment/choose-plan-payment.component';
import { PaymentSuccessComponent } from './features/user/components/payment-success/payment-success.component';
import { PaymentFailedComponent } from './features/user/components/payment-failed/payment-failed.component';

import { AdminDashboardComponent } from './features/admin/pages/dashboard/dashboard.component';
import { ManageGymsComponent } from './features/admin/pages/manage-gyms/manage-gyms.component';

import { GymDetailsComponent } from './features/admin/pages/gym-details/gym-details.component';

import { EditGymComponent } from './features/admin/pages/edit-gym-details/edit-gym-details.component';

import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';

import { GymOwnerDetailsComponent } from './features/admin/pages/gym-owner-application-details/gym-owner-application-details.component';


import { ManageUsersComponent } from './features/admin/pages/manage-users/manage-users.component';
import { UserDetailsComponent } from './features/admin/pages/user-details/user-details.component';
import { EditUserComponent } from './features/admin/pages/edit-user-details/edit-user-details.component';

import { ReportsComponent } from './features/admin/pages/reports/reports.component';
import { ReportDetailsComponent } from './features/admin/pages/report-details/report-details.component';


import { GymOwnerDashboardComponent } from './features/gym-owner/components/dashboard/dashboard.component';
import { GymOwnerLayoutComponent } from './layouts/gym-owner-dashboard/gym-owner-dashboard.component';
import { BranchesComponent } from './features/gym-owner/components/manage-branches/manage-branches.component';
import { AddBranchComponent } from './features/gym-owner/components/add-branch/add-branch.component';
import { BranchDetailsComponent } from './features/gym-owner/components/branch-details/branch-details.component';
import { EditBranchComponent } from './features/gym-owner/components/edit-branch/edit-branch.component';
import{ SubscriptionPlansComponent } from './features/gym-owner/components/subscription-plans/subscription-plans.component';
import { AddSubscriptionPlansComponent } from './features/gym-owner/components/add-subscription-plans/add-subscription-plans.component';

import { ManageStaffComponent } from './features/gym-owner/components/manage-staff/manage-staff.component';
import { AddStaffComponent } from './features/gym-owner/components/add-staff/add-staff.component';
import { StaffDetailsComponent } from './features/gym-owner/components/staff-details/staff-details.component';
import { EditStaffComponent } from './features/gym-owner/components/edit-staff/edit-staff.component';

import { BranchesListComponent } from './features/gym-owner/components/branch-list/branch-list.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'business-signup', component: BusinessRegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'find-gym', component: FindGymComponent },
  { path: 'gym/:id', component: GymDetailComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'my-schedule', component: DashboardComponent },
  { path: 'account', component: ProfileComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'choose-plan-payment', component: ChoosePlanPaymentComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-failed', component: PaymentFailedComponent },
  { path: 'subscriptions', component: SubscriptionsComponent },
  { path: 'subscriptions/manage/:id', component: ManageSubscriptionComponent },
  { path: 'booking-confirmation', component: BookingConfirmationComponent },
  { path: 'booking-history', component: BookingHistoryComponent },


  {
    path: 'admin',
    component: DashboardLayoutComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'gym-owner-application/:id', component: GymOwnerDetailsComponent },
      {path: 'manage-users', component: ManageUsersComponent},
      {path: 'user-details/:id', component: UserDetailsComponent},
      {path: 'edit-user/:id', component: EditUserComponent},
       { path: 'manage-gyms', component: ManageGymsComponent },
      { path: 'edit-gym/:id', component: EditGymComponent },
      {
        path: 'gym-details/:id',
        component: GymDetailsComponent,
      },
      {path: 'reports', component: ReportsComponent},
      {path: 'report-details/:id', component: ReportDetailsComponent}
    ],
  },
  {path: 'gym-owner', component: GymOwnerLayoutComponent,
    children: [
  {path: 'dashboard', component: GymOwnerDashboardComponent},
  {path: 'manage-branches', component: BranchesComponent},
  {path: 'add-branch', component: AddBranchComponent},
  {path: 'branch-details/:id', component: BranchDetailsComponent},
  {path: 'edit-branch/:id', component: EditBranchComponent},
  {path: 'subscription-plans/:id', component: SubscriptionPlansComponent},
  {path: 'add-subscription-plan', component: AddSubscriptionPlansComponent},
  {path: 'manage-staff/:id', component: ManageStaffComponent},
  {path: 'add-staff/:id', component: AddStaffComponent},
   {path: 'manage-staff', component: ManageStaffComponent},
   {path: 'add-staff', component: AddStaffComponent},
   {path: 'staff-details/:id', component: StaffDetailsComponent},
   {path: 'edit-staff/:id', component: EditStaffComponent},
   {path: 'branches-list', component: BranchesListComponent}
  ]},

  { path: '**', redirectTo: '' },
];
