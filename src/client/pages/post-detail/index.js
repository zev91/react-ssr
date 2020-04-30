import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from './redux';
import withInitialData from 'src/componentHOC/with-initial-data';
import withStyles from 'isomorphic-style-loader/withStyles';
import moment from 'moment';
import composeHOC from 'src/utils/composeHOC';
import marked from 'marked';
import hljs from 'highlight.js';
import Fab from '@material-ui/core/Fab';
import { Avatar } from '@material-ui/core';
import languageList from 'src/componentCommon/editor/language-list';
import AddCommentInput from './add-comment-input';
import CommentsLists from './comments-lists';
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Toast from 'src/componentCommon/toast';

import PostOpBars from './post-op-bars';

import css from './style.scss';


marked.setOptions({
  langPrefix: "hljs language-",
  highlight: function (code) {
    return hljs.highlightAuto(code, languageList).value;
  }
});

//组件
class PostDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.headerRef = createRef();
  }

  static state() {
    return (
      { page: {} }
    )
  }


  static async getInitialProps({ store }) {
    return store.dispatch(actions.getInitialData());
  }

  onScoll = () => {
    const height = document.getElementsByClassName('post-detail-header')[0].getBoundingClientRect().height;
    const scrollTop = document.getElementById('root').scrollTop;

    if (scrollTop > height) {
      this.appHeader.classList.add('header-visible');
      this.hoverBars.classList.add('hover-bars-wrap-visible');
      this.sideAuthInfo.classList.add('side-auth-info-visible');
    } else {
      this.appHeader.classList.remove('header-visible');
      this.hoverBars.classList.remove('hover-bars-wrap-visible');
      this.sideAuthInfo.classList.remove('side-auth-info-visible');
    }
  }

  componentDidMount() {
    this.appHeader = document.getElementsByClassName('app-header')[0];
    this.postDetailHeader = document.getElementsByClassName('post-detail-header')[0];
    this.hoverBars = document.getElementsByClassName('hover-bars-wrap')[0];
    this.sideAuthInfo = document.getElementsByClassName('side-auth-info')[0];
    this.getSidePosition();

    document.getElementById('root').addEventListener('scroll', this.onScoll.bind(this));

    window.addEventListener('resize', this.getSidePosition);
  }
  componentWillUnmount() {
    this.appHeader.classList.remove('header-visible');
    document.getElementById('root').removeEventListener('scroll', this.onScoll.bind(this));
    window.removeEventListener('resize', this.getSidePosition);
  }

  getSidePosition = () => {
    const clientWidth = document.body.clientWidth;
    let left = 20;
    let right = -220;

    if (clientWidth > 1112) {
      left = (clientWidth - 920) / 2 - 76;
    };

    if (clientWidth > 1360) {
      right = (clientWidth - 920) / 2 - 220;
    };

    this.setState({
      hoverBarsLeft: left,
      sideAuthInfoRight: right
    });
  }

  // getSideAuthInfoRight = () => {
  //   const clientWidth = document.body.clientWidth;
  //   let left = 0;
  //   if(clientWidth <= 1112){
  //     left = 20;
  //   };
  //   if(clientWidth > 1112 ){
  //     left = (clientWidth - 920)/2 - 76;
  //   };

  //   this.setState({
  //     hoverBarsLeft: left
  //   });
  // }

  handlerLike = async () => {
    const { currentUser } = this.props;
    const { id } = this.props.match.params

    if (!currentUser._id) {
      Toast.error('请先登录！');
      return;
    }
    const res = await this.props.likePost(id);
    if (res && res.success) {
      this.props.getPostLikers(id);
    }
  }

  handlerCollection = async () => {
    const { currentUser } = this.props;
    const { id } = this.props.match.params

    if (!currentUser._id) {
      Toast.error('请先登录！');
      return;
    }
    const res = await this.props.collectionPost(id);
    if (res && res.success) {
      this.props.getCollectioned(id);
      Toast.success(res.data.message);
    }
  }

  handerFollow = async () => {
    const { currentUser } = this.props;
    const { id } = this.props.match.params;
    const { _id } = this.props.post.author;

    if (!currentUser._id) {
      Toast.error('请先登录！');
      return;
    }
    const res = await this.props.followauthor(_id);
    if (res && res.success) {
      this.props.hasFollowedAuthor(id);
      Toast.success(res.data.message);
    }
  }

  render() {
    const { currentUser, post, comments, likers, hasCollectioned, hasFollowed } = this.props;

    return (
      <div className='post-detail-page'>
        <div className={`hover-bars-wrap`} style={{ left: this.state.hoverBarsLeft + 'px' }}>
          <div className={likers.find(liker => liker._id === currentUser._id) ? 'liked' : ''}>
            <Fab size="small">
              <FavoriteIcon size="small" color='disabled' onClick={this.handlerLike} />
            </Fab>
            <div className='like-num'>{likers.length}赞</div>
          </div>
          <PostOpBars hasCollectioned={hasCollectioned} handlerCollection={this.handlerCollection} />
        </div>

        <div className='side-auth-info' style={{ right: this.state.sideAuthInfoRight + 'px' }}>
          <div className='title'>
            <span>关于作者</span>
            <span className={`follow-author ${hasFollowed ? 'followed' : ''}`} onClick={this.handerFollow}>{hasFollowed ? '已关注' : '关注'}</span>
          </div>
          <div className='auth-info-content'>
            <div className='avater-work'>
              {
                post.author && post.author.avator
                  ?
                  <Avatar className='user-avater' src={post.author && post.author.avator} />
                  :
                  <Avatar className='user-avater'>
                    {post.author && post.author.username[0].toUpperCase()}
                  </Avatar>
              }

              <div className='auth-info-work'>
                <div>{post.author && post.author.username}</div>
                <div>{post.author && post.author.jobTitle}</div>
              </div>
            </div>
            {
              post.author && post.author.totalLikes 
              ?
              <div className='active-info'>
                <span><FavoriteIcon fontSize='small' color='primary' /> </span>
              获得点赞 {post.author.totalLikes}
              </div>
              :
              ''
            }

            {
              post.author && post.author.totalReads
              ?
              <div className='active-info'>
                <span><VisibilityIcon fontSize='small' color='primary' /> </span>
                文章被阅读 {post.author.totalReads}
              </div>
              :
              ''
            }
          </div>
        </div>
        <div
          // ref={this.headerRef}
          className='post-detail-header'
          style={{
            background: `#808080 url(${post.headerBg + '?x-oss-process=style/post-header-bg'}) center no-repeat`,
            backgroundSize: 'cover'
          }}
        >
          <div className='container'>
            <div className='post-heading'>
              <h1>{post.title}</h1>
              <span className='meta'>
                作者 {post.username}
                <span>日期 {moment(post.createdAt).format("YYYY-MM-DD")}</span>
                <span>阅读 {post.read && post.read.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')}</span>
              </span>

              <div className='post-tags'>
                {
                  post.tags.map((tag, idx) => <span key={tag + idx} className='tag-item'>{tag}</span>)
                }
              </div>
            </div>
          </div>
        </div>
        <div className='preview-content post-detail'>
          <div className='preview-content-html'>
            <div dangerouslySetInnerHTML={{ __html: marked(post.body, { breaks: true }) }} />
          </div>
        </div>

        <AddCommentInput
          currentUser={this.props.currentUser}
          comments={comments}
          createComment={this.props.createComment}
          getComment={this.props.getComment}
        />

        <CommentsLists
          comments={comments}
          currentUser={this.props.currentUser}
          createComment={this.props.createComment}
          deleteComment={this.props.deleteComment}
          getComment={this.props.getComment}
          match={this.props.match}
        />
      </div>

    )
  }
}

const mapStateToProps = state => ({
  currentUser: state.userInfo,
  initialData: state.postDetailPage,
  post: state.postDetailPage.post,
  comments: state.postDetailPage.comments,
  likers: state.postDetailPage.likers,
  hasCollectioned: state.postDetailPage.hasCollectioned,
  hasFollowed: state.postDetailPage.hasFollowed
});

//将获取数据的方法也做为 props传递给组件
const mapDispatchToProps = dispatch => (
  bindActionCreators({ ...actions }, dispatch)
)

export default composeHOC(
  withStyles(css),
  withInitialData,
  connect(mapStateToProps, mapDispatchToProps, null)
)(PostDetail); 