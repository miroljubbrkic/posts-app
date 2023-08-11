import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  

  isLoading = false
  posts:Post[] = []

  totalPosts = 0
  postsPerPage = 2
  currentPage = 1
  pageSizeOption = [1, 2, 5, 10]
  private postsSub!: Subscription

  userIsAuthenticated = false
  userId: string
  private authStatusSubs: Subscription

  constructor(public postService: PostsService, private authService: AuthService) {}


  ngOnInit(): void {
    this.isLoading = true
    this.postService.getPosts(this.postsPerPage, this.currentPage)
    this.userId = this.authService.getUserId()

    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false
        this.totalPosts = postData.postCount
        this.posts = postData.posts
      })

    this.userIsAuthenticated = this.authService.getIsAuth()

    this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated
      this.userId = this.authService.getUserId()
    })


  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize
    this.postService.getPosts(this.postsPerPage, this.currentPage)
  }

  onDelete(postId: string) {
    this.isLoading = true
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage)
    }, () => {
      this.isLoading = false
    })
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe()
    this.authStatusSubs.unsubscribe()
  }






}
