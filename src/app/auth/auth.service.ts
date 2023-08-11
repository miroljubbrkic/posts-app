import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment'; 

const BACKEND_URL = environment.apiUrl + '/user/'


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated = false
  private token: string
  private authStatusListener = new Subject<boolean>()
  private tokenTimer: NodeJS.Timer
  private userId: string

  constructor(private http: HttpClient, private router: Router) { }


  getToken() {
    return this.token
  }
  getIsAuth() {
    return this.isAuthenticated
  }
  getUserId() {
    return this.userId
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable()
  }



  createUser(email: string, password: string) {

    const authData: AuthData = {email: email, password: password}
    this.http.post(BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate['/']
      }, error => {
        this.authStatusListener.next(false)
      })
  }


  login(email: string, password: string) {

    const authData: AuthData = {email: email, password: password}
    this.http.post<{token: string, expiresIn: number, userId: string}>
    (BACKEND_URL + '/login', authData).subscribe(response => {
      
      const token = response.token
      this.token = token

      if(token) {

        const expiresInDuration = response.expiresIn
        this.setAuthTimer(expiresInDuration)
        
        

        this.isAuthenticated = true
        this.userId = response.userId
        this.authStatusListener.next(true)

        const now = new Date()
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000)
        console.log(expirationDate);
        this.saveAuthData(token, expirationDate, this.userId)
        this.router.navigate(['/'])
      }
    }, error => {
      this.authStatusListener.next(false)
    })
  }

  autoAuthUser() {
    const authInfo = this.getAuthData()
    if(!authInfo) {
      return
    }
    const now = new Date()
    const expiresIn = authInfo.expiriationDate.getTime() - now.getTime()
    console.log(authInfo, expiresIn);

    if(expiresIn > 0) {
      this.token = authInfo.token
      this.isAuthenticated = true
      this.userId = authInfo.userId
      this.setAuthTimer(expiresIn / 1000)
      this.authStatusListener.next(true)
    }

  }


  logout() {
    this.token = null
    this.isAuthenticated = false
    this.authStatusListener.next(false)
    clearTimeout(this.tokenTimer)
    this.clearAuthData()
    this.userId = null
    this.router.navigate(['/'])
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout()
    }, duration * 1000)
  }


  private saveAuthData(token: string, expirationDate: Date, userId: string) {

    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString())
    localStorage.setItem('userId', userId)
  }

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userId')
  }

  private getAuthData() {
    const token = localStorage.getItem('token')
    const expiriationDate = localStorage.getItem('expiration')
    const userId = localStorage.getItem('userId')

    if(!token && !expiriationDate) {
      return null
    }

    return {
      token: token,
      expiriationDate: new Date(expiriationDate),
      userId: userId
    }

  }





}
