import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Dimensions,
    View,
    Text,
    TouchableWithoutFeedback
} from "react-native";
import PropTypes from 'prop-types'
import SFZoomViewConfig from './SFZoomViewConfig'
export default class SFZoomViewHeader extends Component {

    constructor(props) {
        super(props)

        this.state = {

        }
    }
    static propTypes = {
        cropWidth: PropTypes.number.isRequired,
        maxIndex: PropTypes.number.isRequired,
        curIndex: PropTypes.number.isRequired,
        onShare: PropTypes.func,
    }
    componentDidMount(){

    }
    clickShare = () => {
        if (this.props.onShare){
            this.props.onShare(this.props.curIndex)
        }
    }
    render_share = () => {
        if (SFZoomViewConfig.is_show_share){
            return(
                <TouchableWithoutFeedback onPress={this.clickShare}>
                    <Image resizeMode={'center'} style={{
                        width:80,
                        height:80
                    }} source={require('./img/share.png')}></Image>
                </TouchableWithoutFeedback>
            )
        }
        return null;
    }
    render() {
        return (
            <View style={{
                width:this.props.cropWidth,
                height:80,
                alignItems:'center',
                flexDirection:'row',
                position:'absolute',
                left:0,
                top:0
            }}>
                <View style={{
                    width:80
                }}></View>
                <Text style={{
                    width:this.props.cropWidth-160,
                    color:'white',
                    textAlign:'center',
                    fontSize:16
                }}>{(this.props.curIndex+1)+'/'+this.props.maxIndex}</Text>
                <View style={{
                    width:80
                }}>
                    {this.render_share()}
                </View>

            </View>
        )
    }

}

const styles = StyleSheet.create(

)
