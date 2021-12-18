import React from "react";
import { useState, useEffect, useRef } from 'react'
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import { ethers } from 'ethers'
import Web3 from 'web3'
import Web3Modal from "web3modal";
import { getImg } from "../../hook/Helper";
import styles from './Home.module.sass';
import axios from 'axios'
import { CustomButton } from "../../components/CustomButton";
import CrocosFarmCont from "../../ABI/CrocosFarm.json";
import CrocosNFTCont from "../../ABI/CrocosNFT.json";
const CrocosFarmAddr = "0xa7F25Ecf449a498A7F41112f35B6e1EE2dc1a4f7";
const CrocosNFTAddr = "0x18b73D1f9e2d97057deC3f8D6ea9e30FCADB54D7";
let myAddr = "";
const netchainId = 25;
const netchainIdHex = '0x152';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
};

export const CardObj = () => {

    const [open, setOpen] = useState(false);
    const [tokensOfOwner, setTokensOfOwner] = useState([]);
    const [stakeState, setStakeState] = useState(false);
    const [harvest, setHarvest] = useState(0);
    const [selectedNFT, setSelectedNFT] = useState([])
    document.getElementById("content")
    const StandardImageList = (props) => {
        const clickHandler = (event, e) => {
            if (selectedNFT.includes(e)) setSelectedNFT(selectedNFT.filter(item => item !== e))
            else setSelectedNFT([...selectedNFT, e])
            event.target.scrollIntoView();
        }
        return (
            <ImageList sx={{ width: 'auto', height: 450, padding: '50px' }} cols={4}>
                {props.itemData.map((item, key) => (
                    <div className={selectedNFT.includes(item.tokenId) ? styles.active : ""} key={key}>
                        <ImageListItem onClick={(event) => clickHandler(event, item.tokenId)}>
                            <div className={styles.image_card}>
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={item.title}
                                    position="below"
                                />
                            </div>
                        </ImageListItem>
                    </div>
                ))}
            </ImageList>
        );
    }

    const onClickStake = async () => {

        for (let i = 0; i < selectedNFT.length; i++) {
            selectedNFT[i] = selectedNFT[i] - 0;
        }
        console.log(selectedNFT)
        if (selectedNFT.length > 0) {
            const web3 = new Web3(Web3.givenProvider);
            let farmContract;
            let nftContract;
            try {
                const chainId = await web3.eth.getChainId()
                if (chainId === netchainId) {
                    const web3Modal = new Web3Modal();
                    const connection = await web3Modal.connect();
                    const provider = new ethers.providers.Web3Provider(connection);
                    const signer = provider.getSigner();
                    farmContract = new ethers.Contract(
                        CrocosFarmAddr,
                        CrocosFarmCont.abi,
                        signer
                    );
                    nftContract = new ethers.Contract(
                        CrocosNFTAddr,
                        CrocosNFTCont.abi,
                        signer
                    );
                    if (stakeState === true) {
                        const nftCon = await nftContract.setApprovalForAll(CrocosFarmAddr, 1);
                        await nftCon.wait();
                        const farmCon = await farmContract.batchStake(selectedNFT);
                        await farmCon.wait();
                        setOpen(false)
                    } else {
                        const farmCon = await farmContract.batchWithdraw(selectedNFT);
                        await farmCon.wait();
                        setOpen(false)
                    }
                    setSelectedNFT([])
                } else {
                    try {
                        await web3.currentProvider.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: netchainIdHex }]
                        });
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            alert('please select nft')
        }
    }

    useEffect(() => {
        const timer = setInterval(async () => {
            const web3 = new Web3(Web3.givenProvider);
            let farmContract;
            try {
                const chainId = await web3.eth.getChainId()
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                // console.log(myAddr)
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                );
                if (chainId === netchainId) {

                    const reward = (await farmContract.getTotalClaimable(myAddr) / Math.pow(10, 18)).toString().slice(0, 7);
                    setHarvest(reward);

                } else {
                    try {
                        clearInterval(timer)
                        await web3.currentProvider.request({
                            method: "wallet_switchCronoschain",
                            params: [{ chainId: netchainIdHex }]
                        });

                    } catch (error) {
                        console.log(error.message);
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }, 3000)
    }, [])

    const onClickPick = async () => {
        setStakeState(true);
        setSelectedNFT([]);
        const web3 = new Web3(Web3.givenProvider);
        let nftContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                nftContract = new ethers.Contract(
                    CrocosNFTAddr,
                    CrocosNFTCont.abi,
                    provider
                );
                // const balance = await nftContract.balanceOf(myAddr);
                const walletOfOwner = await nftContract.walletOfOwner(myAddr);
                const tokenData = [];
                for (var i = 0; i < walletOfOwner.length; i++) {
                    let tokenURI = await nftContract.tokenURI(walletOfOwner[i] - 0);
                    // tokenURI = tokenURI.slice(0, 82)
                    const nftMetaData = await axios.get(tokenURI);
                    console.log(nftMetaData)
                    const nftTokenData = { img: `https://ipfs.io/ipfs/${nftMetaData.data.image.slice(7)}`, title: nftMetaData.data.name, tokenId: walletOfOwner[i] }
                    tokenData.push(nftTokenData);
                }
                setTokensOfOwner(tokenData);
                console.log(tokenData)
                setOpen(true)   
            } else {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_switchCronosChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }

    }

    const onClickHarvest = async () => {
        console.log('clicked')
        const web3 = new Web3(Web3.givenProvider);
        let farmContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                )
                if (harvest > 0) {
                    const farmCon = await farmContract.harvest();
                    await farmCon.wait();
                }

            } else {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_switchCronosChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    const onClickWithdraw = async () => {
        setStakeState(false);
        setSelectedNFT([])
        console.log(selectedNFT)
        const tokenData = [];
        console.log('clicked')
        const web3 = new Web3(Web3.givenProvider);
        let farmContract;
        let nftContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                );
                nftContract = new ethers.Contract(
                    CrocosNFTAddr,
                    CrocosNFTCont.abi,
                    signer
                );
                const stakeOfOwner = await farmContract.stakeOfOwner(myAddr);
                console.log(stakeOfOwner)
                for (var i = 0; i < stakeOfOwner.length; i++) {
                    let tokenURI = await nftContract.tokenURI(stakeOfOwner[i]);
                    console.log(tokenURI);
                    const nftMetaData = await axios.get(tokenURI);
                    const nftTokenData = { img: `https://ipfs.io/ipfs/${nftMetaData.data.image.slice(7)}`, title: nftMetaData.data.name, tokenId: stakeOfOwner[i] }
                    tokenData.push(nftTokenData);
                }
                setTokensOfOwner(tokenData);
                console.log(tokenData)
                setOpen(true)
            } else {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_switchCronosChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }

    }

    return (
        <div>
            <div className={styles.card}>
                <div className={styles.title}>Stake NFT get CROCOS 100% APR</div>
                <img src={getImg('home/nft.png')} alt="nft" />
                <CustomButton value="Pick NFT" onClick={onClickPick} />
                <div className={styles.box}>
                    <h5>Reward</h5>
                    <p>{harvest} CROCOS</p>
                    <CustomButton value="Harvest" onClick={onClickHarvest} />
                </div>
                <CustomButton value="Withdraw" onClick={onClickWithdraw} />
            </div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <StandardImageList itemData={tokensOfOwner} stakeState={stakeState} />
                        <CustomButton value={stakeState ? "Stake" : "Withdraw"} onClick={onClickStake} style={{ float: 'right', margin: '0 10px 10px', width: 150 }} />
                    </Box>
                </Fade>
            </Modal>
        </div>
    )
}