/**
 *
 *
 */
import React, {Component} from "react";
import PropTypes from 'prop-types'
import {
    StyleSheet,
    Image,
    View,
    TouchableWithoutFeedback,
    PanResponder,
    Animated,
    Easing,
    ActivityIndicator

} from "react-native";
import { UIManager} from 'NativeModules';
import resolveAssetSource from 'resolveAssetSource';
import SFZoomViewConfig from './SFZoomViewConfig'
import SFZoomShowAnimated from './SFZoomShowAnimated'
import SFZoomImageCache from './SFZoomImageCache'
export default class SFZoomImage extends Component {

    constructor(props) {
        super(props)
        this.state=({
            loadding : false,
            isShow : false
        })
    }
    static propTypes = {
        index:PropTypes.number.isRequired,
        firstIndex:PropTypes.number.isRequired,
        imgData: PropTypes.object.isRequired,
        cropWidth: PropTypes.number.isRequired,
        cropHeight: PropTypes.number.isRequired,
        onNext: PropTypes.func.isRequired,
        onLast: PropTypes.func.isRequired,
        onRecover: PropTypes.func.isRequired,
        onHorizontalOuter: PropTypes.func.isRequired,
        onHide: PropTypes.func.isRequired,
        onAniZoomEnd: PropTypes.func.isRequired,
        onAniZoomBegin: PropTypes.func.isRequired,
    }
    componentWillMount() {
        this.isParentOuter = false;
        this.horizontalWholeOuterCounter = 0

        this.dealImageSize();

        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {

                return true;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                
                this.onPanResponderGrant(evt,gestureState)
            },
            onPanResponderMove: (evt, gestureState) => {
                this.onPanResponderMove(evt,gestureState);
                this.onPanResponderZoom(evt,gestureState);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
                this.onPanResponderRelease(evt,gestureState)

            },
            onPanResponderTerminate: (evt, gestureState) => {
                // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
                // 默认返回true。目前暂时只支持android。
                return true;
            },
        });
    }
    componentDidMount(){


    }
    dealImageSize = () => {
        this.width = 0;
        this.height = 0;
        this.aniWidth = new Animated.Value(this.width);
        this.aniHeight = new Animated.Value(this.height);
        if (typeof(this.props.imgData.big_path)=='string'){//网络图片
            var imgInfo = SFZoomImageCache.getImage(this.props.imgData.big_path);
            if (!imgInfo){
                Image.getSize(this.props.imgData.big_path,(width,height)=>{
                    var w = this.props.cropWidth;
                    var h = height*this.props.cropWidth/width;
                    if (h > this.props.cropHeight){
                        w = width*this.props.cropHeight/height;
                        h = this.props.cropHeight;
                    }
                    this.width = w;
                    this.height = h;
                    this.aniWidth.setValue(w);
                    this.aniHeight.setValue(h);

                    SFZoomImageCache.insertImage(this.props.imgData.big_path,{width:w,height:h})
                })
            }else{
                this.width = imgInfo.width;
                this.height = imgInfo.height;
                this.aniWidth.setValue(this.width);
                this.aniHeight.setValue(this.height);
            }

        }else{//本地图片
            let source = resolveAssetSource(this.props.imgData.big_path)
            var w = this.props.cropWidth;
            var h = source.height*this.props.cropWidth/source.width;
            if (h > this.props.cropHeight){
                w = source.width*this.props.cropHeight/source.height;
                h = this.props.cropHeight;
            }
            this.width = w;
            this.height = h;
            this.aniWidth.setValue(w);
            this.aniHeight.setValue(h);
        }

        this.scale = 1;
        this.posX = 0;
        this.posY = 0;
        this.aniScale = new Animated.Value(this.scale);
        this.aniPosX = new Animated.Value(this.posX);
        this.aniPosY = new Animated.Value(this.posY);
    }
    render_loadding = () => {
        return(
            <View style={{
                position:'absolute',
                left:0,
                top:0,
                width:this.props.cropWidth,
                height:this.props.cropHeight,
                alignItems:'center',
                justifyContent:'center',
                overflow:'hidden'
            }}>
                <ActivityIndicator
                    animating={this.state.loadding}
                    color="white"
                    size="small"
                />
            </View>
        )
    }




    onAniZoomEnd = (isFadeIn) => {
        if (isFadeIn){
            this.isShowAniFinish = true;
            if (this.isShowAniFinish && this.isImgLoaded){
                this.refZoomAni.hide();
                this.setState({isShow:true})
            }
        }else{
            this.onHide();
        }
        this.props.onAniZoomEnd(isFadeIn);
    }
    onAniZoomBegin = (isFadeIn) => {
        if (isFadeIn == false){
            this.setState({isShow:false})
        }
        this.props.onAniZoomBegin(isFadeIn);
    }

    showZoomFadeIn = () => {
        if (SFZoomViewConfig.is_show_ani == false){
            this.setState({isShow:true})
            this.props.onAniZoomEnd(true);
            return;
        }
        this.isImgLoaded = false;
        this.isShowAniFinish = false;
        UIManager.measure(this.props.imgData.ctrHandel, (x, y, width, height, pageX, pageY) => {

            this.refZoomAni.init(this.props.imgData.small_path,pageX,pageY,width,height,true);
            if (this.width != 0 && this.height != 0){
                this.refZoomAni.show(0,(this.props.cropHeight-this.height)/2,this.width,this.height);
            }else{
                var toHeight = this.props.cropWidth*height/width;
                this.refZoomAni.show(0,(this.props.cropHeight-toHeight)/2,this.props.cropWidth,toHeight);
            }

        })
    }
    showZoomFadeOut = () => {
        if (SFZoomViewConfig.is_show_ani == false){
            this.onHide();
            return;
        }
        UIManager.measure(this.props.imgData.ctrHandel, (x, y, width, height, pageX, pageY) => {
            var w = this.width*this.scale;
            var h = this.height*this.scale;
            var x = this.posX+(this.props.cropWidth-w)/2;
            var y = this.posY+(this.props.cropHeight-h)/2;
            this.refZoomAni.init(this.props.imgData.small_path,x,y,w,h,false);
            this.refZoomAni.show(pageX,pageY,width,height);
        })
    }
    render() {
        var imgSrc;
        if (typeof(this.props.imgData.big_path) == 'string'){
            imgSrc = {uri:this.props.imgData.big_path}
        }else{
            imgSrc = this.props.imgData.big_path;
        }
        var opacity = 0;
        if (this.state.isShow){
            opacity = 1;
        }
        return (
            <View {...this._panResponder.panHandlers} style={{
                width:this.props.cropWidth,
                height:this.props.cropHeight,
                backgroundColor:'transparent',
                alignItems:'center',
                justifyContent:'center',
            }}

            >
                <Animated.Image
                    onLoadStart={()=>{
                        this.setState({loadding:true})
                    }}
                    onLoadEnd={()=>{
                        this.setState({loadding:false})
                        this.isImgLoaded = true;
                        if (this.props.firstIndex == this.props.index){
                            if (this.isShowAniFinish && this.isImgLoaded){
                                this.refZoomAni.hide();
                                this.setState({isShow:true})
                            }
                        }else{
                            this.setState({isShow:true})
                        }

                    }}
                    source={imgSrc}
                    style={{
                        opacity:opacity,
                        width:this.aniWidth,
                        height:this.aniHeight,
                        transform:[{scale:this.aniScale},{translateX:this.aniPosX},{translateY:this.aniPosY}]
                }}>
                </Animated.Image>
                <SFZoomShowAnimated ref={(ref) => {this.refZoomAni = ref}}
                                    cropWidth={this.props.cropWidth}
                                    cropHeight={this.props.cropHeight}
                                    onShowBegin={this.onAniZoomBegin}
                                    onShowEnd={this.onAniZoomEnd}
                />

                {this.render_loadding()}
            </View>
        )
    }
    onPanResponderGrant = (evt,gestureState)=>{
        this.lastDis = null
        this.lastPosX = null
        this.lastPosY = null
        this.lastTapTime = new Date().getTime()
        this.timer && clearInterval(this.timer)
    }
    onPanResponderMove = (evt,gestureState) => {

        // x 位移
        let diffX = gestureState.dx - this.lastPosX
        if (this.lastPosX === null) {
            diffX = 0
        }
        // y 位移
        let diffY = gestureState.dy - this.lastPosY
        if (this.lastPosY === null) {
            diffY = 0
        }

        diffX /= this.scale;
        diffY /= this.scale;
        if (this.width*this.scale>this.props.cropWidth){//可以横向移动

            const horizontalMax = (this.width * this.scale - this.props.cropWidth) / 2 / this.scale;
            if (this.posX+diffX <  -horizontalMax){
                this.posX = -horizontalMax;
                this.horizontalWholeOuterCounter += diffX
            }else if (this.posX+diffX > horizontalMax){
                this.posX = horizontalMax;
                this.horizontalWholeOuterCounter += diffX
            }
            if (this.horizontalWholeOuterCounter > 0) { // 溢出在右侧
                if (diffX < 0) { // 从右侧收紧
                    if (this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                        // 偏移量还没有用完
                        this.horizontalWholeOuterCounter += diffX
                        diffX = 0
                    } else {
                        // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                        diffX += this.horizontalWholeOuterCounter
                        this.horizontalWholeOuterCounter = 0
                    }
                } else { // 向右侧扩增
                    this.horizontalWholeOuterCounter += diffX
                }

            } else if (this.horizontalWholeOuterCounter < 0) { // 溢出在左侧
                if (diffX > 0) { // 从左侧收紧
                    if (Math.abs(this.horizontalWholeOuterCounter) > diffX) {
                        // 偏移量还没有用完
                        this.horizontalWholeOuterCounter += diffX
                        diffX = 0
                    } else {
                        // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                        diffX += this.horizontalWholeOuterCounter
                        this.horizontalWholeOuterCounter = 0
                    }
                } else { // 向左侧扩增
                    this.horizontalWholeOuterCounter += diffX
                }
            } else {
                // 溢出偏移量为0，正常移动
            }
            this.checkAllowZoom()
            if (evt.nativeEvent.touches.length < 2) {
                this.props.onHorizontalOuter(this.props.index, this.horizontalWholeOuterCounter)

            }
            if (this.horizontalWholeOuterCounter == 0){
                this.posX += diffX;
                this.aniPosX.setValue(this.posX);
            }
        }else if(this.width*this.scale==this.props.cropWidth) {
            this.checkAllowZoom()
            if (evt.nativeEvent.touches.length < 2){
                this.horizontalWholeOuterCounter += diffX
                this.props.onHorizontalOuter(this.props.index, this.horizontalWholeOuterCounter)
            }

        }else{
            this.checkAllowZoom()

            //两指缩放移动  阻尼效果

            const horizontalMax = (this.width * this.scale - this.props.cropWidth) / 2 / this.scale;
            if (diffX < 0){
                if (this.posX < horizontalMax*0.7) {
                    this.posX += diffX * 0.1;
                }else{
                    this.posX += diffX;
                }
            }else{
                if (this.posX > -horizontalMax*0.7) {
                    this.posX += diffX * 0.1;
                }else{
                    this.posX += diffX;
                }
            }

            this.aniPosX.setValue(this.posX);

        }
        if (this.height*this.scale>this.props.cropHeight){//可以竖向移动
            this.posY += diffY;
            this.aniPosY.setValue(this.posY);
        }
        // 保留这一次位移作为下次的上一次位移
        this.lastPosX = gestureState.dx
        this.lastPosY = gestureState.dy



    }
    onPanResponderZoom = (evt,gestureState) => {
        if (this.isParentOuter){
            return;
        }
        //多点触摸防抖
        if (evt.nativeEvent.touches.length < 2){
            this.touchId1 = null;
            this.touchId2 = null;
        }else {
            this.touchId1 = evt.nativeEvent.touches[0].identifier;
            this.touchId2 = evt.nativeEvent.touches[1].identifier;
        }
        var touch1 = null,touch2 = null;
        for (var i = 0; i < evt.nativeEvent.touches.length; i++){
            var touch = evt.nativeEvent.touches[i];
            if (touch.identifier == this.touchId1){
                touch1 = touch;
            }else if (touch.identifier == this.touchId2){
                touch2 = touch;
            }
        }
        if (touch1 == null || touch2 == null){
            return;
        }
        var wd = Math.abs(touch1.pageX-touch2.pageX);
        var hd = Math.abs(touch1.pageY-touch2.pageY);
        var curDis = Math.sqrt(wd * wd + hd * hd)
        curDis = Number(curDis.toFixed(1))

        var diff = (curDis - this.lastDis)/200;
        if (this.lastDis == null){
            diff = 0;
        }


        var zoom = this.scale + diff;
        if (zoom < 0.6){
            zoom = 0.6;
        }
        if (zoom > 5){
            zoom = 5;
        }
        // 找到两手中心点距离页面中心的位移
        // const centerDiffX = (touch1.pageX +touch2.pageX) / 2 - this.props.cropWidth / 2
        // const centerDiffY = (touch1.pageY + touch2.pageY) / 2 - this.props.cropHeight / 2

        // this.posX -= centerDiffX*diff;
        // this.posY -= centerDiffY*diff;
        // this.aniPosX.setValue(this.posX);
        // this.aniPosY.setValue(this.posY);

        this.scale = zoom;


        this.aniScale.setValue(this.scale);

        this.lastDis = curDis;

    }
    onHide = () => {
        this.props.onHide();

    }
    onPanResponderRelease = (evt,gestureState) => {
        this.recoverScale()
        this.recoverPosX()
        this.recoverPosY()
        //滑动减速
        this.scrollDec(gestureState)


        //判断是否需要更换图片
        if (this.horizontalWholeOuterCounter != 0 || this.props.imgData.type == SFZoomViewConfig.ZOOM_TYPE_LONG_IMG){
            if (gestureState.vx > SFZoomViewConfig.max_speed_x){
                this.onLast()
            }else if (gestureState.vx < -SFZoomViewConfig.max_speed_x) {
                this.onNext()
            }else{
                if (this.horizontalWholeOuterCounter < -SFZoomViewConfig.max_move_x/this.scale){
                    this.onNext()
                }else if (this.horizontalWholeOuterCounter > SFZoomViewConfig.max_move_x/this.scale){
                    this.onLast()
                }else{
                    this.onRecover()
                }
            }
        }


        // 水平溢出量置空
        this.horizontalWholeOuterCounter = 0
        this.isParentOuter = false;

        //判断是否是单点退出
        const stayTime = new Date().getTime() - this.lastTapTime;
        const moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy)
        if (evt.nativeEvent.changedTouches.length <= 1 && stayTime < 300 && moveDistance < 10) {
            this.showZoomFadeOut();
        }
    }
    //检测病设置是否以缩放
    checkAllowZoom = () => {
        if (Math.abs(this.horizontalWholeOuterCounter) > 10){
            this.isParentOuter = true;
        }else{
            this.isParentOuter = false;
        }
    }
    onRecover = () => {
        this.props.onRecover(this.props.index)
    }
    onLast = () => {
        if(this.props.onLast(this.props.index)){
            this.recoverImage()
        }
    }
    onNext = () => {
        if (this.props.onNext(this.props.index)){
            this.recoverImage()
        }
    }
    recoverPosX = () => {
        if (this.width * this.scale <= this.props.cropWidth) {
            // 如果图片宽度小于盒子宽度，横向位置重置
            this.posX = 0
            Animated.timing(this.aniPosX, {
                toValue: this.posX,
                duration: 100,
            }).start()
        }
    }
    recoverPosY = () => {
        if (this.height * this.scale <= this.props.cropHeight) {
            // 如果图片高度小于盒子高度，纵向位置重置
            this.posY = 0
            Animated.timing(this.aniPosY, {
                toValue: this.posY,
                duration: 100,
            }).start()
        }
    }
    recoverScale = () => {
        if (this.scale < 1) {
            this.scale = 1
            Animated.timing(this.aniScale, {
                toValue: this.scale,
                duration: 100,
            }).start()
        }
        else if (this.scale > 3){
            this.scale = 3
            Animated.timing(this.aniScale, {
                toValue: this.scale,
                duration: 100,
            }).start()
        }
    }
    //减速滚动
    scrollDec = (gestureState) => {
        if (this.scale > 1){
            if(this.horizontalWholeOuterCounter == 0){
                const horizontalMax = (this.width * this.scale - this.props.cropWidth) / 2 / this.scale;
                if (Math.abs(gestureState.vx) > 0.2){

                    this.timer && clearInterval(this.timer)
                    if (this.posX > horizontalMax || this.posX < -horizontalMax){

                    }else{
                        var dis = gestureState.vx*100;
                        if (this.posX+dis > horizontalMax){
                            dis = horizontalMax-this.posX;
                        }
                        if (this.posX+dis < -horizontalMax){
                            dis = -horizontalMax-this.posX;
                        }
                        this.curEndDis = this.posX+dis;
                        this.v = Math.abs(gestureState.vx)*10;
                        this.t = 800;
                        this.a = ((this.v*this.t-Math.abs(dis))*2)/(this.t*this.t);
                        this.lastTimer = 0;

                        this.vx = gestureState.vx;
                        this.timer = setInterval(()=>{
                            this.lastTimer+=19;

                            var dif = this.v-this.a*this.lastTimer;



                            if (this.vx > 0){
                                this.posX+=dif;
                                if (this.posX > this.curEndDis){
                                    this.posX = this.curEndDis;
                                }
                                this.aniPosX.setValue(this.posX);
                            }else{
                                this.posX-=dif;
                                if (this.posX < this.curEndDis){
                                    this.posX = this.curEndDis;
                                    clearInterval(this.timer);
                                }
                                this.aniPosX.setValue(this.posX);
                            }
                            if (dif <= 0){
                                clearInterval(this.timer)
                            }

                        },19);
                    }
                }
            }

        }
    }

    recoverImage = () => {
        if (this.scale > 1){
            this.scale = 1
            Animated.timing(this.aniScale, {
                toValue: this.scale,
                duration: 100,
            }).start(()=>{
                this.posX = 0
                Animated.timing(this.aniPosX, {
                    toValue: this.posX,
                    duration: 100,
                }).start()
                this.posY = 0
                Animated.timing(this.aniPosY, {
                    toValue: this.posY,
                    duration: 100,
                }).start()
            })
        }

    }
}

const styles = StyleSheet.create(

)
